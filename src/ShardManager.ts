/**
 * @since 1.0.0
 */
import * as HashMap from "@effect/data//HashMap"
import * as Chunk from "@effect/data/Chunk"
import { Tag } from "@effect/data/Context"
import { equals } from "@effect/data/Equal"
import { pipe } from "@effect/data/Function"
import * as HashSet from "@effect/data/HashSet"
import * as List from "@effect/data/List"
import * as Option from "@effect/data/Option"
import * as Clock from "@effect/io/Clock"
import * as Effect from "@effect/io/Effect"
import * as Hub from "@effect/io/Hub"
import * as Layer from "@effect/io/Layer"
import * as RefSynchronized from "@effect/io/Ref/Synchronized"
import * as Schedule from "@effect/io/Schedule"
import * as ManagerConfig from "@effect/shardcake/ManagerConfig"
import type * as Pod from "@effect/shardcake/Pod"
import * as PodAddress from "@effect/shardcake/PodAddress"
import * as Pods from "@effect/shardcake/Pods"
import * as PodsHealth from "@effect/shardcake/PodsHealth"
import * as PodWithMetadata from "@effect/shardcake/PodWithMetadata"
import * as ShardError from "@effect/shardcake/ShardError"
import * as ShardId from "@effect/shardcake/ShardId"
import * as ShardingEvent from "@effect/shardcake/ShardingEvent"
import * as ShardManagerState from "@effect/shardcake/ShardManagerState"
import * as Storage from "@effect/shardcake/Storage"
import * as Stream from "@effect/stream/Stream"
import { groupBy, minByOption, showHashSet } from "./utils"

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManager {
  getShardingEvents: Stream.Stream<never, never, ShardingEvent.ShardingEvent>
  register(pod: Pod.Pod): Effect.Effect<never, never, void>
  unregister(podAddress: PodAddress.PodAddress): Effect.Effect<never, never, void>
  notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  checkAllPodsHealth: Effect.Effect<never, never, void>
  /* @internal */
  rebalance(rebalanceImmediately: boolean): Effect.Effect<never, never, void>
  /* @internal */
  getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >
  /* @internal */
  persistPods: Effect.Effect<never, never, void>
}

/**
 * @since 1.0.0
 * @category context
 */
export const ShardManager = Tag<ShardManager>()

function make(
  stateRef: RefSynchronized.Synchronized<ShardManagerState.ShardManagerState>,
  rebalanceSemaphore: Effect.Semaphore,
  eventsHub: Hub.Hub<ShardingEvent.ShardingEvent>,
  healthApi: PodsHealth.PodsHealth,
  podApi: Pods.Pods,
  stateRepository: Storage.Storage,
  config: ManagerConfig.ManagerConfig
): ShardManager {
  const getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  > = pipe(
    RefSynchronized.get(stateRef),
    Effect.map((_) => _.shards)
  )

  const getShardingEvents = Stream.fromHub(eventsHub)

  function register(pod: Pod.Pod) {
    return pipe(
      Effect.logInfo("Registering " + PodAddress.show(pod.address) + "@" + pod.version),
      Effect.zipRight(
        RefSynchronized.updateAndGetEffect(stateRef, (state) =>
          pipe(
            Effect.flatMap(Effect.clock, (_) => _.currentTimeMillis),
            Effect.map((cdt) =>
              ShardManagerState.make(
                HashMap.set(state.pods, pod.address, PodWithMetadata.make(pod, cdt)),
                state.shards
              )
            )
          ))
      ),
      Effect.zipLeft(Hub.publish(eventsHub, ShardingEvent.PodRegistered(pod.address))),
      Effect.flatMap((state) => Effect.when(rebalance(false), () => HashSet.size(state.unassignedShards) > 0)),
      Effect.zipRight(Effect.forkDaemon(persistPods)),
      Effect.asUnit
    )
  }

  function stateHasPod(podAddress: PodAddress.PodAddress) {
    return pipe(
      RefSynchronized.get(stateRef),
      Effect.map((_) => HashMap.has(_.pods, podAddress))
    )
  }

  function notifyUnhealthyPod(podAddress: PodAddress.PodAddress) {
    return pipe(
      Effect.whenEffect(
        pipe(
          Hub.publish(eventsHub, ShardingEvent.PodHealthChecked(podAddress)),
          Effect.zipRight(
            Effect.unlessEffect(
              Effect.zipRight(
                Effect.logWarning(`${podAddress} is not alive, unregistering`),
                unregister(podAddress)
              ),
              healthApi.isAlive(podAddress)
            )
          )
        ),
        stateHasPod(podAddress)
      ),
      Effect.asUnit
    )
  }

  const checkAllPodsHealth = pipe(
    RefSynchronized.get(stateRef),
    Effect.map((_) => HashMap.keySet(_.pods)),
    Effect.flatMap((_) => (Effect.forEach(_, notifyUnhealthyPod, { concurrency: 4, discard: true })))
  )

  function unregister(podAddress: PodAddress.PodAddress) {
    const eff = pipe(
      Effect.Do,
      Effect.zipLeft(Effect.logInfo(`Unregistering ${podAddress}`)),
      Effect.bind("unassignments", (_) =>
        pipe(
          stateRef,
          RefSynchronized.modify((state) => [
            pipe(
              state.shards,
              HashMap.filter((pod) => equals(pod)(Option.some(podAddress))),
              HashMap.keySet
            ),
            {
              ...state,
              pods: HashMap.remove(state.pods, podAddress),
              shards: HashMap.map(state.shards, (_) => equals(_)(Option.some(podAddress)) ? Option.none() : _)
            }
          ])
        )),
      Effect.tap((_) => Hub.publish(eventsHub, ShardingEvent.PodUnregistered(podAddress))),
      Effect.tap((_) =>
        Effect.when(
          Hub.publish(eventsHub, ShardingEvent.ShardsUnassigned(podAddress, _.unassignments)),
          () => HashSet.size(_.unassignments) > 0
        )
      ),
      Effect.zipLeft(Effect.forkDaemon(persistPods)),
      Effect.zipLeft(Effect.forkDaemon(rebalance(true)))
    )
    return Effect.asUnit(Effect.whenEffect(eff, stateHasPod(podAddress)))
  }

  function withRetry<E, A>(zio: Effect.Effect<never, E, A>): Effect.Effect<never, never, void> {
    return pipe(
      zio,
      Effect.retry(
        pipe(
          Schedule.spaced(config.persistRetryInterval),
          Schedule.andThen(Schedule.recurs(config.persistRetryCount))
        )
      ),
      Effect.ignore
    )
  }

  const persistAssignments = withRetry(
    pipe(
      RefSynchronized.get(stateRef),
      Effect.flatMap((state) => stateRepository.saveAssignments(state.shards))
    )
  )

  const persistPods = withRetry(
    pipe(
      RefSynchronized.get(stateRef),
      Effect.flatMap((state) => stateRepository.savePods(HashMap.map(state.pods, (v) => v.pod)))
    )
  )

  function updateShardsState(
    shards: HashSet.HashSet<ShardId.ShardId>,
    pod: Option.Option<PodAddress.PodAddress>
  ) {
    return RefSynchronized.updateEffect(stateRef, (state) => {
      if (Option.isSome(pod) && !HashMap.has(state.pods, pod.value)) {
        return Effect.fail(ShardError.PodNoLongerRegistered(pod.value))
      }
      return Effect.succeed({
        ...state,
        shards: pipe(
          state.shards,
          HashMap.map((assignment, shard) => HashSet.has(shards, shard) ? pod : assignment)
        )
      })
    })
  }

  function rebalance(rebalanceImmediately: boolean): Effect.Effect<never, never, void> {
    const algo1 = pipe(
      Effect.Do,
      Effect.bind("state", () => RefSynchronized.get(stateRef)),
      Effect.let("_1", ({ state }) =>
        rebalanceImmediately || HashSet.size(state.unassignedShards) > 0
          ? decideAssignmentsForUnassignedShards(state)
          : decideAssignmentsForUnbalancedShards(state, config.rebalanceRate)),
      Effect.let("assignments", (_) => _._1[0]),
      Effect.let("unassignments", (_) => _._1[1]),
      Effect.let(
        "areChanges",
        (_) => HashMap.size(_.assignments) > 0 || HashMap.size(_.unassignments) > 0
      ),
      Effect.tap((_) =>
        Effect.when(
          Effect.logDebug(
            "Rebalance (rebalanceImmidiately=" + JSON.stringify(rebalanceImmediately) + ")"
          ),
          () => _.areChanges
        )
      ),
      // ping pods first to make sure they are ready and remove those who aren't
      Effect.bind("failedPingedPods", (_) =>
        pipe(
          Effect.forEach(
            HashSet.union(HashMap.keySet(_.assignments), HashMap.keySet(_.unassignments)),
            (pod) =>
              pipe(
                podApi.ping(pod),
                Effect.timeout(config.pingTimeout),
                Effect.flatMap(Option.match({ onNone: () => Effect.fail(1), onSome: () => Effect.succeed(2) })),
                Effect.match({
                  onFailure: () => Chunk.fromIterable([pod]),
                  onSuccess: () => Chunk.empty()
                })
              ),
            { concurrency: "inherit" }
          ),
          Effect.map(Chunk.fromIterable),
          Effect.map(Chunk.flatten),
          Effect.map(HashSet.fromIterable)
        )),
      Effect.let("shardsToRemove", (_) =>
        pipe(
          List.fromIterable(_.assignments),
          List.appendAll(List.fromIterable(_.unassignments)),
          List.filter(([pod, __]) => HashSet.has(_.failedPingedPods, pod)),
          List.map(([_, shards]) => List.fromIterable(shards)),
          List.flatMap((_) => _), // TODO: List is missing flatMap
          HashSet.fromIterable
        ))
    )
    const algo2 = pipe(
      algo1,
      Effect.let("readyAssignments", (_) =>
        pipe(
          _.assignments,
          HashMap.map(HashSet.difference(_.shardsToRemove)),
          HashMap.filter((__) => HashSet.size(__) > 0)
        )),
      Effect.let("readyUnassignments", (_) =>
        pipe(
          _.unassignments,
          HashMap.map(HashSet.difference(_.shardsToRemove)),
          HashMap.filter((__) => HashSet.size(__) > 0)
        )),
      // do the unassignments first
      Effect.bind("failed", (_) =>
        pipe(
          Effect.forEach(_.readyUnassignments, ([pod, shards]) =>
            pipe(
              podApi.unassignShards(pod, shards),
              Effect.zipRight(updateShardsState(shards, Option.none())),
              Effect.matchEffect({
                onFailure: () => Effect.succeed([HashSet.fromIterable([pod]), shards] as const),
                onSuccess: () =>
                  pipe(
                    Hub.publish(eventsHub, ShardingEvent.ShardsUnassigned(pod, shards)),
                    Effect.as(
                      [
                        HashSet.empty<PodAddress.PodAddress>(),
                        HashSet.empty<ShardId.ShardId>()
                      ] as const
                    )
                  )
              })
            ), { concurrency: "inherit" }),
          Effect.map(Chunk.fromIterable),
          Effect.map((_) => Chunk.unzip(_)),
          Effect.map(
            ([pods, shards]) => [Chunk.map(pods, Chunk.fromIterable), Chunk.map(shards, Chunk.fromIterable)] as const
          ),
          Effect.map(
            ([pods, shards]) =>
              [
                HashSet.fromIterable(Chunk.flatten(pods)),
                HashSet.fromIterable(Chunk.flatten(shards))
              ] as const
          )
        )),
      Effect.let("failedUnassignedPods", (_) => _.failed[0]),
      Effect.let("failedUnassignedShards", (_) => _.failed[1]),
      // remove assignments of shards that couldn't be unassigned, as well as faulty pods.
      Effect.let("filteredAssignments", (_) =>
        pipe(
          HashMap.removeMany(_.readyAssignments, _.failedUnassignedPods),
          HashMap.map((shards, __) => HashSet.difference(shards, _.failedUnassignedShards))
        )),
      // then do the assignments
      Effect.bind("failedAssignedPods", (_) =>
        pipe(
          Effect.forEach(_.filteredAssignments, ([pod, shards]) =>
            pipe(
              podApi.assignShards(pod, shards),
              Effect.zipRight(updateShardsState(shards, Option.some(pod))),
              Effect.matchEffect({
                onFailure: () => Effect.succeed(Chunk.fromIterable([pod])),
                onSuccess: () =>
                  pipe(
                    Hub.publish(eventsHub, ShardingEvent.ShardsAssigned(pod, shards)),
                    Effect.as(Chunk.empty())
                  )
              })
            ), { concurrency: "inherit" }),
          Effect.map(Chunk.fromIterable),
          Effect.map(Chunk.flatten),
          Effect.map(HashSet.fromIterable)
        )),
      Effect.let("failedPods", (_) =>
        HashSet.union(
          HashSet.union(_.failedPingedPods, _.failedUnassignedPods),
          _.failedAssignedPods
        )),
      // check if failing pods are still up
      Effect.tap((_) => Effect.forkDaemon(Effect.forEach(_.failedPods, notifyUnhealthyPod, { discard: true }))),
      Effect.tap((_) =>
        Effect.when(
          Effect.logDebug(
            "Failed to rebalance pods: " +
              showHashSet(PodAddress.show)(_.failedPods) +
              " failed pinged: " + showHashSet(PodAddress.show)(_.failedPingedPods) +
              " failed assigned: " + showHashSet(PodAddress.show)(_.failedAssignedPods) +
              " failed unassigned: " + showHashSet(PodAddress.show)(_.failedUnassignedPods)
          ),
          () => HashSet.size(_.failedPods) > 0
        )
      ),
      // retry rebalancing later if there was any failure
      Effect.tap((_) =>
        pipe(
          Effect.sleep(config.rebalanceRetryInterval),
          Effect.zipRight(rebalance(rebalanceImmediately)),
          Effect.forkDaemon,
          Effect.when(() => HashSet.size(_.failedPods) > 0 && rebalanceImmediately)
        )
      ),
      // persist state changes to Redis
      Effect.tap((_) =>
        pipe(
          persistAssignments,
          Effect.forkDaemon,
          Effect.when(() => _.areChanges)
        )
      )
    )

    return rebalanceSemaphore.withPermits(1)(algo2)
  }

  return {
    getAssignments,
    getShardingEvents,
    register,
    unregister,
    persistPods,
    rebalance,
    notifyUnhealthyPod,
    checkAllPodsHealth
  }
}

/** @internal */
export function decideAssignmentsForUnassignedShards(state: ShardManagerState.ShardManagerState) {
  return pickNewPods(List.fromIterable(state.unassignedShards), state, true, 1)
}

/** @internal */
export function decideAssignmentsForUnbalancedShards(
  state: ShardManagerState.ShardManagerState,
  rebalanceRate: number
) {
  // don't do regular rebalance in the middle of a rolling update
  const extraShardsToAllocate = state.allPodsHaveMaxVersion
    ? pipe(
      state.shardsPerPod,
      HashMap.flatMap((shards, _) => {
        // count how many extra shards compared to the average
        const extraShards = Math.max(HashSet.size(shards) - state.averageShardsPerPod.value, 0)
        return pipe(
          HashMap.empty(),
          HashMap.set(_, HashSet.fromIterable(List.take(List.fromIterable(shards), extraShards)))
        )
      }),
      HashSet.fromIterable,
      HashSet.map((_) => _[1]),
      HashSet.flatMap((_) => _)
    )
    : HashSet.empty()

  /*
        TODO: port sortBy

    val sortedShardsToRebalance = extraShardsToAllocate.toList.sortBy { shard =>
      // handle unassigned shards first, then shards on the pods with most shards, then shards on old pods
      state.shards.get(shard).flatten.fold((Int.MinValue, OffsetDateTime.MIN)) { pod =>
        (
          state.shardsPerPod.get(pod).fold(Int.MinValue)(-_.size),
          state.pods.get(pod).fold(OffsetDateTime.MIN)(_.registered)
        )
      }
    }
* */
  const sortedShardsToRebalance = List.fromIterable(extraShardsToAllocate)
  return pickNewPods(sortedShardsToRebalance, state, false, rebalanceRate)
}

function pickNewPods(
  shardsToRebalance: List.List<ShardId.ShardId>,
  state: ShardManagerState.ShardManagerState,
  rebalanceImmediately: boolean,
  rebalanceRate: number
): readonly [
  assignments: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>,
  unassignments: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>
] {
  const [_, assignments] = pipe(
    List.reduce(
      shardsToRebalance,
      [
        state.shardsPerPod,
        List.empty<readonly [ShardId.ShardId, PodAddress.PodAddress]>()
      ] as const,
      ([shardsPerPod, assignments], shard) => {
        const unassignedPods = pipe(
          assignments,
          List.flatMap(([shard, _]) =>
            pipe(
              HashMap.get(state.shards, shard),
              Option.flatten,
              Option.toArray,
              List.fromIterable
            )
          )
        )

        // find pod with least amount of shards
        return pipe(
          // keep only pods with the max version
          HashMap.filter(shardsPerPod, (_, pod) => {
            const maxVersion = state.maxVersion
            if (Option.isNone(maxVersion)) return true
            return pipe(
              HashMap.get(state.pods, pod),
              Option.map(PodWithMetadata.extractVersion),
              Option.map((_) => PodWithMetadata.compareVersion(_, maxVersion.value) === 0),
              Option.getOrElse(() => false)
            )
          }),
          // don't assign too many shards to the same pods, unless we need rebalance immediately
          HashMap.filter((_, pod) => {
            if (rebalanceImmediately) return true
            return (
              pipe(
                assignments,
                List.filter(([_, p]) => equals(p)(pod)),
                List.size
              ) <
                HashMap.size(state.shards) * rebalanceRate
            )
          }),
          // don't assign to a pod that was unassigned in the same rebalance
          HashMap.filter(
            (_, pod) => !Option.isSome(List.findFirst(unassignedPods, equals(pod)))
          ),
          minByOption(([_, pods]) => HashSet.size(pods)),
          Option.match({
            onNone: () => [shardsPerPod, assignments] as const,
            onSome: ([pod, shards]) => {
              const oldPod = Option.flatten(HashMap.get(state.shards, shard))
              // if old pod is same as new pod, don't change anything
              if (equals(oldPod)(pod)) {
                return [shardsPerPod, assignments] as const
                // if the new pod has more, as much, or only 1 less shard than the old pod, don't change anything
              } else if (
                Option.match(HashMap.get(shardsPerPod, pod), { onNone: () => 0, onSome: HashSet.size }) + 1 >=
                  Option.match(
                    oldPod,
                    {
                      onNone: () => Number.MAX_SAFE_INTEGER,
                      onSome: (_) =>
                        Option.match(HashMap.get(shardsPerPod, _), { onNone: () => 0, onSome: HashSet.size })
                    }
                  )
              ) {
                return [shardsPerPod, assignments] as const

                // otherwise, create a new assignment
              } else {
                const unassigned = Option.match(
                  oldPod,
                  {
                    onNone: () => shardsPerPod,
                    onSome: (oldPod) => HashMap.modify(shardsPerPod, oldPod, HashSet.remove(shard))
                  }
                )
                return [
                  HashMap.modify(unassigned, pod, (_) => HashSet.add(shards, shard)),
                  List.prepend(assignments, [shard, pod] as const)
                ] as const
              }
            }
          })
        )
      }
    )
  )

  const unassignments = List.flatMap(assignments, ([shard, _]) =>
    pipe(
      Option.flatten(HashMap.get(state.shards, shard)),
      Option.map((_) => [shard, _] as const),
      Option.match({ onNone: List.empty, onSome: List.of })
    ))

  const assignmentsPerPod = pipe(
    assignments,
    groupBy(([_, pod]) => pod),
    HashMap.map(HashSet.map(([shardId, _]) => shardId))
  )
  const unassignmentsPerPod = pipe(
    unassignments,
    groupBy(([_, pod]) => pod),
    HashMap.map(HashSet.map(([shardId, _]) => shardId))
  )
  return [assignmentsPerPod, unassignmentsPerPod] as const
}

const live0 = pipe(
  Effect.Do,
  Effect.bind("config", (_) => ManagerConfig.ManagerConfig),
  Effect.bind("stateRepository", (_) => Storage.Storage),
  Effect.bind("healthApi", (_) => PodsHealth.PodsHealth),
  Effect.bind("podApi", (_) => Pods.Pods),
  Effect.bind("pods", (_) => _.stateRepository.getPods),
  Effect.bind("assignments", (_) => _.stateRepository.getAssignments),
  // remove unhealthy pods on startup
  Effect.bind("filteredPods", (_) =>
    pipe(
      Effect.filter(_.pods, ([podAddress]) => _.healthApi.isAlive(podAddress), { concurrency: "inherit" }),
      Effect.map(HashMap.fromIterable)
    )),
  Effect.let("filteredAssignments", (_) =>
    pipe(
      HashMap.filter(
        _.assignments,
        (pod) => Option.isSome(pod) && HashMap.has(_.filteredPods, pod.value)
      )
    )),
  Effect.bind("cdt", (_) => Clock.currentTimeMillis),
  Effect.let("initialState", (_) =>
    ShardManagerState.make(
      HashMap.map(_.filteredPods, (pod) => PodWithMetadata.make(pod, _.cdt)),
      HashMap.union(
        _.filteredAssignments,
        pipe(
          Chunk.range(1, _.config.numberOfShards),
          Chunk.map((n) => [ShardId.make(n), Option.none()] as const),
          HashMap.fromIterable
        )
      )
    ))
)
const live1 = pipe(
  live0,
  Effect.bind("state", (_) => RefSynchronized.make(_.initialState)),
  Effect.bind("rebalanceSemaphore", (_) => Effect.makeSemaphore(1)),
  Effect.bind("eventsHub", (_) => Hub.unbounded<ShardingEvent.ShardingEvent>()),
  Effect.let("shardManager", (_) =>
    make(
      _.state,
      _.rebalanceSemaphore,
      _.eventsHub,
      _.healthApi,
      _.podApi,
      _.stateRepository,
      _.config
    )),
  Effect.tap((_) => Effect.forkDaemon(_.shardManager.persistPods)),
  // rebalance immediately if there are unassigned shards
  Effect.tap((_) => _.shardManager.rebalance(HashSet.size(_.initialState.unassignedShards) > 0)),
  // start a regular rebalance at the given interval
  Effect.tap((_) =>
    pipe(
      _.shardManager.rebalance(false),
      Effect.repeat(Schedule.spaced(_.config.rebalanceInterval)),
      Effect.forkDaemon
    )
  ),
  Effect.tap((_) =>
    pipe(
      _.shardManager.getShardingEvents,
      Stream.mapEffect((_) => Effect.logInfo(JSON.stringify(_))),
      Stream.runDrain,
      Effect.forkDaemon
    )
  ),
  Effect.tap((_) => Effect.logInfo("Shard Manager loaded")),
  Effect.map((_) => _.shardManager)
)

/**
 * @since 1.0.0
 * @category layers
 */
export const live = Layer.effect(ShardManager, live1)
