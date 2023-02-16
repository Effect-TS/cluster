import * as ShardManagerState from "./ShardManagerState";
import * as RefSynchronized from "@effect/io/Ref/Synchronized";
import * as Effect from "@effect/io/Effect";
import * as Hub from "@effect/io/Hub";
import * as ShardingEvent from "./ShardingEvent";
import * as PodsHealth from "./PodsHealth";
import * as Pods from "./Pods";
import * as ManagerConfig from "./ManagerConfig";
import { pipe } from "@fp-ts/core/Function";
import * as HashMap from "@fp-ts/data//HashMap";
import * as List from "@fp-ts/data/List";
import * as HashSet from "@fp-ts/data/HashSet";
import * as ShardId from "./ShardId";
import * as PodAddress from "./PodAddress";
import * as PodWithMetadata from "./PodWithMetadata";
import * as Option from "@fp-ts/core/Option";
import * as Stream from "@effect/stream/Stream";
import * as Schedule from "@effect/io/Schedule";
import * as Storage from ".//Storage";
import * as Pod from "./Pod";
import { equals } from "@fp-ts/data/Equal";
import * as ReadonlyArray from "@fp-ts/core/ReadonlyArray";
import * as Order from "@fp-ts/core/typeclass/Order";

export function apply(
  stateRef: RefSynchronized.Synchronized<ShardManagerState.ShardManagerState>,
  rebalanceSemaphore: Effect.Semaphore,
  eventsHub: Hub.Hub<ShardingEvent.ShardingEvent>,
  healthApi: PodsHealth.PodsHealth,
  podApi: Pods.Pods,
  stateRepository: Storage.Storage,
  config: ManagerConfig.ManagerConfig
) {
  const getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  > = pipe(
    RefSynchronized.get(stateRef),
    Effect.map((_) => _.shards)
  );

  const getShardingEvents = Stream.fromHub(eventsHub);

  function register(pod: Pod.Pod) {
    return pipe(
      Effect.logInfo("Registering " + JSON.stringify(pod)),
      Effect.zipRight(
        RefSynchronized.updateAndGetEffect(stateRef, (state) =>
          pipe(
            Effect.flatMap(Effect.clock(), (_) => _.currentTimeMillis()),
            Effect.map((millis) => new Date(millis)),
            Effect.map((cdt) =>
              ShardManagerState.apply(
                HashMap.set(state.pods, pod.address, PodWithMetadata.apply(pod, cdt)),
                state.shards
              )
            )
          )
        )
      ),
      Effect.flatMap((state) =>
        Effect.when(rebalance(false), () => HashSet.size(state.unassignedShards) > 0)
      ),
      Effect.zipRight(Effect.forkDaemon(persistPods)),
      Effect.asUnit
    );
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
    );
  }

  const persistAssignments = withRetry(
    pipe(
      RefSynchronized.get(stateRef),
      Effect.flatMap((state) => stateRepository.saveAssignments(state.shards))
    )
  );

  const persistPods = withRetry(
    pipe(
      RefSynchronized.get(stateRef),
      Effect.flatMap((state) => stateRepository.savePods(HashMap.map(state.pods, (v) => v.pod)))
    )
  );

  return { getAssignments, getShardingEvents, register };
}

function pickNewPods(
  shardsToRebalance: List.List<ShardId.ShardId>,
  state: ShardManagerState.ShardManagerState,
  rebalanceImmediately: boolean,
  rebalanceRate: number
) {
  //: readonly [assignments: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>, unassignments: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>]
  const assignments = pipe(
    List.reduce(
      shardsToRebalance,
      [state.shardsPerPod, List.empty<[ShardId.ShardId, PodAddress.PodAddress]>()] as const,
      ([shardsPerPod, assignments], shardId) => {
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
        );

        // find pod with least amount of shards
        const a = pipe(
          // keep only pods with the max version
          HashMap.filterWithIndex(shardsPerPod, (_, pod) => {
            const maxVersion = state.maxVersion;
            if (Option.isNone(maxVersion)) return true;
            return pipe(
              HashMap.get(state.pods, pod),
              Option.map(PodWithMetadata.extractVersion),
              Option.map((_) => PodWithMetadata.compareVersion(_, maxVersion.value) === 0),
              Option.getOrElse(() => false)
            );
          }),
          // don't assign too many shards to the same pods, unless we need rebalance immediately
          HashMap.filterWithIndex((_, pod) => {
            if (rebalanceImmediately) return true;
            return (
              pipe(
                assignments,
                List.filter(([_, p]) => equals(p)(pod)),
                List.length
              ) <
              HashMap.size(state.shards) * rebalanceRate
            );
          }),
          // don't assign to a pod that was unassigned in the same rebalance
          HashMap.filterWithIndex(
            (_, pod) => !Option.isSome(List.findFirst(unassignedPods, equals(pod)))
          )
        );
      }
    )
  );
}

/*
private def pickNewPods(
    shardsToRebalance: List[ShardId],
    state: ShardManagerState,
    rebalanceImmediately: Boolean,
    rebalanceRate: Double
  ): (Map[PodAddress, Set[ShardId]], Map[PodAddress, Set[ShardId]]) = {
    val (_, assignments)    = shardsToRebalance.foldLeft((state.shardsPerPod, List.empty[(ShardId, PodAddress)])) {
      case ((shardsPerPod, assignments), shard) =>
        val unassignedPods = assignments.flatMap { case (shard, _) => state.shards.get(shard).flatten }.toSet
        // find pod with least amount of shards
        shardsPerPod
          // keep only pods with the max version
          .filter { case (pod, _) =>
            state.maxVersion.forall(max => state.pods.get(pod).map(extractVersion).forall(_ == max))
          }
          // don't assign too many shards to the same pods, unless we need rebalance immediately
          .filter { case (pod, _) =>
            rebalanceImmediately || assignments.count { case (_, p) => p == pod } < state.shards.size * rebalanceRate
          }
          // don't assign to a pod that was unassigned in the same rebalance
          .filterNot { case (pod, _) => unassignedPods.contains(pod) }
          .minByOption(_._2.size) match {
          case Some((pod, shards)) =>
            val oldPod = state.shards.get(shard).flatten
            // if old pod is same as new pod, don't change anything
            if (oldPod.contains(pod))
              (shardsPerPod, assignments)
            // if the new pod has more, as much, or only 1 less shard than the old pod, don't change anything
            else if (
              shardsPerPod.get(pod).fold(0)(_.size) + 1 >= oldPod.fold(Int.MaxValue)(
                shardsPerPod.getOrElse(_, Nil).size
              )
            )
              (shardsPerPod, assignments)
            // otherwise, create a new assignment
            else {
              val unassigned = oldPod.fold(shardsPerPod)(oldPod => shardsPerPod.updatedWith(oldPod)(_.map(_ - shard)))
              (unassigned.updated(pod, shards + shard), (shard, pod) :: assignments)
            }
          case None                => (shardsPerPod, assignments)
        }
    }
    val unassignments       = assignments.flatMap { case (shard, _) => state.shards.get(shard).flatten.map(shard -> _) }
    val assignmentsPerPod   = assignments.groupBy(_._2).map { case (k, v) => k -> v.map(_._1).toSet }
    val unassignmentsPerPod = unassignments.groupBy(_._2).map { case (k, v) => k -> v.map(_._1).toSet }
    (assignmentsPerPod, unassignmentsPerPod)
  }

*/
