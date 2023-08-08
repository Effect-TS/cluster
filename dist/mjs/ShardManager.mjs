/**
 * @since 1.0.0
 */
import * as HashMap from "@effect/data//HashMap";
import * as Chunk from "@effect/data/Chunk";
import { Tag } from "@effect/data/Context";
import { equals } from "@effect/data/Equal";
import * as HashSet from "@effect/data/HashSet";
import * as List from "@effect/data/List";
import * as Option from "@effect/data/Option";
import * as Clock from "@effect/io/Clock";
import * as Effect from "@effect/io/Effect";
import * as Hub from "@effect/io/Hub";
import * as Layer from "@effect/io/Layer";
import * as RefSynchronized from "@effect/io/Ref/Synchronized";
import * as Schedule from "@effect/io/Schedule";
import * as ManagerConfig from "@effect/shardcake/ManagerConfig";
import * as PodAddress from "@effect/shardcake/PodAddress";
import * as Pods from "@effect/shardcake/Pods";
import * as PodsHealth from "@effect/shardcake/PodsHealth";
import * as PodWithMetadata from "@effect/shardcake/PodWithMetadata";
import * as ShardError from "@effect/shardcake/ShardError";
import * as ShardId from "@effect/shardcake/ShardId";
import * as ShardingEvent from "@effect/shardcake/ShardingEvent";
import * as ShardManagerState from "@effect/shardcake/ShardManagerState";
import * as Storage from "@effect/shardcake/Storage";
import * as Stream from "@effect/stream/Stream";
import { groupBy, minByOption, showHashSet } from "./utils";
/**
 * @since 1.0.0
 * @category context
 */
export const ShardManager = /*#__PURE__*/Tag();
function make(stateRef, rebalanceSemaphore, eventsHub, healthApi, podApi, stateRepository, config) {
  const getAssignments = Effect.map(_ => _.shards)(RefSynchronized.get(stateRef));
  const getShardingEvents = Stream.fromHub(eventsHub);
  function register(pod) {
    return Effect.asUnit(Effect.zipRight(Effect.forkDaemon(persistPods))(Effect.flatMap(state => Effect.when(rebalance(false), () => HashSet.size(state.unassignedShards) > 0))(Effect.zipLeft(Hub.publish(eventsHub, ShardingEvent.PodRegistered(pod.address)))(Effect.zipRight(RefSynchronized.updateAndGetEffect(stateRef, state => Effect.map(cdt => ShardManagerState.make(HashMap.set(state.pods, pod.address, PodWithMetadata.make(pod, cdt)), state.shards))(Effect.flatMap(Effect.clock, _ => _.currentTimeMillis))))(Effect.logInfo("Registering " + PodAddress.show(pod.address) + "@" + pod.version))))));
  }
  function stateHasPod(podAddress) {
    return Effect.map(_ => HashMap.has(_.pods, podAddress))(RefSynchronized.get(stateRef));
  }
  function notifyUnhealthyPod(podAddress) {
    return Effect.asUnit(Effect.whenEffect(Effect.zipRight(Effect.unlessEffect(Effect.zipRight(Effect.logWarning(`${podAddress} is not alive, unregistering`), unregister(podAddress)), healthApi.isAlive(podAddress)))(Hub.publish(eventsHub, ShardingEvent.PodHealthChecked(podAddress))), stateHasPod(podAddress)));
  }
  const checkAllPodsHealth = Effect.flatMap(_ => Effect.forEach(_, notifyUnhealthyPod, {
    concurrency: 4,
    discard: true
  }))(Effect.map(_ => HashMap.keySet(_.pods))(RefSynchronized.get(stateRef)));
  function unregister(podAddress) {
    const eff = Effect.zipLeft(Effect.forkDaemon(rebalance(true)))(Effect.zipLeft(Effect.forkDaemon(persistPods))(Effect.tap(_ => Effect.when(Hub.publish(eventsHub, ShardingEvent.ShardsUnassigned(podAddress, _.unassignments)), () => HashSet.size(_.unassignments) > 0))(Effect.tap(_ => Hub.publish(eventsHub, ShardingEvent.PodUnregistered(podAddress)))(Effect.bind("unassignments", _ => RefSynchronized.modify(state => [HashMap.keySet(HashMap.filter(pod => equals(pod)(Option.some(podAddress)))(state.shards)), {
      ...state,
      pods: HashMap.remove(state.pods, podAddress),
      shards: HashMap.map(state.shards, _ => equals(_)(Option.some(podAddress)) ? Option.none() : _)
    }])(stateRef))(Effect.zipLeft(Effect.logInfo(`Unregistering ${podAddress}`))(Effect.Do))))));
    return Effect.asUnit(Effect.whenEffect(eff, stateHasPod(podAddress)));
  }
  function withRetry(zio) {
    return Effect.ignore(Effect.retry(Schedule.andThen(Schedule.recurs(config.persistRetryCount))(Schedule.spaced(config.persistRetryInterval)))(zio));
  }
  const persistAssignments = withRetry(Effect.flatMap(state => stateRepository.saveAssignments(state.shards))(RefSynchronized.get(stateRef)));
  const persistPods = withRetry(Effect.flatMap(state => stateRepository.savePods(HashMap.map(state.pods, v => v.pod)))(RefSynchronized.get(stateRef)));
  function updateShardsState(shards, pod) {
    return RefSynchronized.updateEffect(stateRef, state => {
      if (Option.isSome(pod) && !HashMap.has(state.pods, pod.value)) {
        return Effect.fail(ShardError.PodNoLongerRegistered(pod.value));
      }
      return Effect.succeed({
        ...state,
        shards: HashMap.map((assignment, shard) => HashSet.has(shards, shard) ? pod : assignment)(state.shards)
      });
    });
  }
  function rebalance(rebalanceImmediately) {
    const algo1 = Effect.let("shardsToRemove", _ =>
    // TODO: List is missing flatMap
    HashSet.fromIterable(List.flatMap(_ => _)(List.map(([_, shards]) => List.fromIterable(shards))(List.filter(([pod, __]) => HashSet.has(_.failedPingedPods, pod))(List.appendAll(List.fromIterable(_.unassignments))(List.fromIterable(_.assignments)))))))(
    // ping pods first to make sure they are ready and remove those who aren't
    Effect.bind("failedPingedPods", _ => Effect.map(HashSet.fromIterable)(Effect.map(Chunk.flatten)(Effect.map(Chunk.fromIterable)(Effect.forEach(HashSet.union(HashMap.keySet(_.assignments), HashMap.keySet(_.unassignments)), pod => Effect.match({
      onFailure: () => Chunk.fromIterable([pod]),
      onSuccess: () => Chunk.empty()
    })(Effect.flatMap(Option.match({
      onNone: () => Effect.fail(1),
      onSome: () => Effect.succeed(2)
    }))(Effect.timeout(config.pingTimeout)(podApi.ping(pod)))), {
      concurrency: "inherit"
    })))))(Effect.tap(_ => Effect.when(Effect.logDebug("Rebalance (rebalanceImmidiately=" + JSON.stringify(rebalanceImmediately) + ")"), () => _.areChanges))(Effect.let("areChanges", _ => HashMap.size(_.assignments) > 0 || HashMap.size(_.unassignments) > 0)(Effect.let("unassignments", _ => _._1[1])(Effect.let("assignments", _ => _._1[0])(Effect.let("_1", ({
      state
    }) => rebalanceImmediately || HashSet.size(state.unassignedShards) > 0 ? decideAssignmentsForUnassignedShards(state) : decideAssignmentsForUnbalancedShards(state, config.rebalanceRate))(Effect.bind("state", () => RefSynchronized.get(stateRef))(Effect.Do))))))));
    const algo2 =
    // persist state changes to Redis
    Effect.tap(_ => Effect.when(() => _.areChanges)(Effect.forkDaemon(persistAssignments)))(
    // retry rebalancing later if there was any failure
    Effect.tap(_ => Effect.when(() => HashSet.size(_.failedPods) > 0 && rebalanceImmediately)(Effect.forkDaemon(Effect.zipRight(rebalance(rebalanceImmediately))(Effect.sleep(config.rebalanceRetryInterval)))))(Effect.tap(_ => Effect.when(Effect.logDebug("Failed to rebalance pods: " + showHashSet(PodAddress.show)(_.failedPods) + " failed pinged: " + showHashSet(PodAddress.show)(_.failedPingedPods) + " failed assigned: " + showHashSet(PodAddress.show)(_.failedAssignedPods) + " failed unassigned: " + showHashSet(PodAddress.show)(_.failedUnassignedPods)), () => HashSet.size(_.failedPods) > 0))(
    // check if failing pods are still up
    Effect.tap(_ => Effect.forkDaemon(Effect.forEach(_.failedPods, notifyUnhealthyPod, {
      discard: true
    })))(Effect.let("failedPods", _ => HashSet.union(HashSet.union(_.failedPingedPods, _.failedUnassignedPods), _.failedAssignedPods))(
    // then do the assignments
    Effect.bind("failedAssignedPods", _ => Effect.map(HashSet.fromIterable)(Effect.map(Chunk.flatten)(Effect.map(Chunk.fromIterable)(Effect.forEach(_.filteredAssignments, ([pod, shards]) => Effect.matchEffect({
      onFailure: () => Effect.succeed(Chunk.fromIterable([pod])),
      onSuccess: () => Effect.as(Chunk.empty())(Hub.publish(eventsHub, ShardingEvent.ShardsAssigned(pod, shards)))
    })(Effect.zipRight(updateShardsState(shards, Option.some(pod)))(podApi.assignShards(pod, shards))), {
      concurrency: "inherit"
    })))))(
    // remove assignments of shards that couldn't be unassigned, as well as faulty pods.
    Effect.let("filteredAssignments", _ => HashMap.map((shards, __) => HashSet.difference(shards, _.failedUnassignedShards))(HashMap.removeMany(_.readyAssignments, _.failedUnassignedPods)))(Effect.let("failedUnassignedShards", _ => _.failed[1])(Effect.let("failedUnassignedPods", _ => _.failed[0])(
    // do the unassignments first
    Effect.bind("failed", _ => Effect.map(([pods, shards]) => [HashSet.fromIterable(Chunk.flatten(pods)), HashSet.fromIterable(Chunk.flatten(shards))])(Effect.map(([pods, shards]) => [Chunk.map(pods, Chunk.fromIterable), Chunk.map(shards, Chunk.fromIterable)])(Effect.map(_ => Chunk.unzip(_))(Effect.map(Chunk.fromIterable)(Effect.forEach(_.readyUnassignments, ([pod, shards]) => Effect.matchEffect({
      onFailure: () => Effect.succeed([HashSet.fromIterable([pod]), shards]),
      onSuccess: () => Effect.as([HashSet.empty(), HashSet.empty()])(Hub.publish(eventsHub, ShardingEvent.ShardsUnassigned(pod, shards)))
    })(Effect.zipRight(updateShardsState(shards, Option.none()))(podApi.unassignShards(pod, shards))), {
      concurrency: "inherit"
    }))))))(Effect.let("readyUnassignments", _ => HashMap.filter(__ => HashSet.size(__) > 0)(HashMap.map(HashSet.difference(_.shardsToRemove))(_.unassignments)))(Effect.let("readyAssignments", _ => HashMap.filter(__ => HashSet.size(__) > 0)(HashMap.map(HashSet.difference(_.shardsToRemove))(_.assignments)))(algo1))))))))))));
    return rebalanceSemaphore.withPermits(1)(algo2);
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
  };
}
/** @internal */
export function decideAssignmentsForUnassignedShards(state) {
  return pickNewPods(List.fromIterable(state.unassignedShards), state, true, 1);
}
/** @internal */
export function decideAssignmentsForUnbalancedShards(state, rebalanceRate) {
  // don't do regular rebalance in the middle of a rolling update
  const extraShardsToAllocate = state.allPodsHaveMaxVersion ? HashSet.flatMap(_ => _)(HashSet.map(_ => _[1])(HashSet.fromIterable(HashMap.flatMap((shards, _) => {
    // count how many extra shards compared to the average
    const extraShards = Math.max(HashSet.size(shards) - state.averageShardsPerPod.value, 0);
    return HashMap.set(_, HashSet.fromIterable(List.take(List.fromIterable(shards), extraShards)))(HashMap.empty());
  })(state.shardsPerPod)))) : HashSet.empty();
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
  const sortedShardsToRebalance = List.fromIterable(extraShardsToAllocate);
  return pickNewPods(sortedShardsToRebalance, state, false, rebalanceRate);
}
function pickNewPods(shardsToRebalance, state, rebalanceImmediately, rebalanceRate) {
  const [_, assignments] = List.reduce(shardsToRebalance, [state.shardsPerPod, List.empty()], ([shardsPerPod, assignments], shard) => {
    const unassignedPods = List.flatMap(([shard, _]) => List.fromIterable(Option.toArray(Option.flatten(HashMap.get(state.shards, shard)))))(assignments);
    // find pod with least amount of shards
    return Option.match({
      onNone: () => [shardsPerPod, assignments],
      onSome: ([pod, shards]) => {
        const oldPod = Option.flatten(HashMap.get(state.shards, shard));
        // if old pod is same as new pod, don't change anything
        if (equals(oldPod)(pod)) {
          return [shardsPerPod, assignments];
          // if the new pod has more, as much, or only 1 less shard than the old pod, don't change anything
        } else if (Option.match(HashMap.get(shardsPerPod, pod), {
          onNone: () => 0,
          onSome: HashSet.size
        }) + 1 >= Option.match(oldPod, {
          onNone: () => Number.MAX_SAFE_INTEGER,
          onSome: _ => Option.match(HashMap.get(shardsPerPod, _), {
            onNone: () => 0,
            onSome: HashSet.size
          })
        })) {
          return [shardsPerPod, assignments];
          // otherwise, create a new assignment
        } else {
          const unassigned = Option.match(oldPod, {
            onNone: () => shardsPerPod,
            onSome: oldPod => HashMap.modify(shardsPerPod, oldPod, HashSet.remove(shard))
          });
          return [HashMap.modify(unassigned, pod, _ => HashSet.add(shards, shard)), List.prepend(assignments, [shard, pod])];
        }
      }
    })(minByOption(([_, pods]) => HashSet.size(pods))(
    // don't assign to a pod that was unassigned in the same rebalance
    HashMap.filter((_, pod) => !Option.isSome(List.findFirst(unassignedPods, equals(pod))))(
    // don't assign too many shards to the same pods, unless we need rebalance immediately
    HashMap.filter((_, pod) => {
      if (rebalanceImmediately) return true;
      return List.size(List.filter(([_, p]) => equals(p)(pod))(assignments)) < HashMap.size(state.shards) * rebalanceRate;
    })(
    // keep only pods with the max version
    HashMap.filter(shardsPerPod, (_, pod) => {
      const maxVersion = state.maxVersion;
      if (Option.isNone(maxVersion)) return true;
      return Option.getOrElse(() => false)(Option.map(_ => PodWithMetadata.compareVersion(_, maxVersion.value) === 0)(Option.map(PodWithMetadata.extractVersion)(HashMap.get(state.pods, pod))));
    })))));
  });
  const unassignments = List.flatMap(assignments, ([shard, _]) => Option.match({
    onNone: List.empty,
    onSome: List.of
  })(Option.map(_ => [shard, _])(Option.flatten(HashMap.get(state.shards, shard)))));
  const assignmentsPerPod = HashMap.map(HashSet.map(([shardId, _]) => shardId))(groupBy(([_, pod]) => pod)(assignments));
  const unassignmentsPerPod = HashMap.map(HashSet.map(([shardId, _]) => shardId))(groupBy(([_, pod]) => pod)(unassignments));
  return [assignmentsPerPod, unassignmentsPerPod];
}
/**
 * @since 1.0.0
 * @category layers
 */
export const live = /*#__PURE__*/Effect.gen(function* (_) {
  const config = yield* _(ManagerConfig.ManagerConfig);
  const stateRepository = yield* _(Storage.Storage);
  const healthApi = yield* _(PodsHealth.PodsHealth);
  const podsApi = yield* _(Pods.Pods);
  const pods = yield* _(stateRepository.getPods);
  const assignments = yield* _(stateRepository.getAssignments);
  const filteredPods = yield* _(Effect.filter(pods, ([podAddress]) => healthApi.isAlive(podAddress), {
    concurrency: "inherit"
  }), Effect.map(HashMap.fromIterable));
  const filteredAssignments = HashMap.filter(assignments, pod => Option.isSome(pod) && HashMap.has(filteredPods, pod.value));
  const cdt = yield* _(Clock.currentTimeMillis);
  const initialState = ShardManagerState.make(HashMap.map(filteredPods, pod => PodWithMetadata.make(pod, cdt)), HashMap.union(filteredAssignments, HashMap.fromIterable(Chunk.map(n => [ShardId.make(n), Option.none()])(Chunk.range(1, config.numberOfShards)))));
  const state = yield* _(RefSynchronized.make(initialState));
  const rebalanceSemaphore = yield* _(Effect.makeSemaphore(1));
  const eventsHub = yield* _(Hub.unbounded());
  const shardManager = make(state, rebalanceSemaphore, eventsHub, healthApi, podsApi, stateRepository, config);
  yield* _(Effect.forkDaemon(shardManager.persistPods));
  // rebalance immediately if there are unassigned shards
  yield* _(shardManager.rebalance(HashSet.size(initialState.unassignedShards) > 0));
  // start a regular rebalance at the given interval
  yield* _(shardManager.rebalance(false), Effect.repeat(Schedule.spaced(config.rebalanceInterval)), Effect.forkDaemon);
  // log info events
  yield* _(shardManager.getShardingEvents, Stream.mapEffect(_ => Effect.logInfo(JSON.stringify(_))), Stream.runDrain, Effect.forkDaemon);
  yield* _(Effect.logInfo("Shard Manager loaded"));
  return shardManager;
}).pipe( /*#__PURE__*/Layer.effect(ShardManager));
//# sourceMappingURL=ShardManager.mjs.map