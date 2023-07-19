"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShardManager = void 0;
exports.decideAssignmentsForUnassignedShards = decideAssignmentsForUnassignedShards;
exports.decideAssignmentsForUnbalancedShards = decideAssignmentsForUnbalancedShards;
exports.live = void 0;
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data//HashMap"));
var Chunk = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Chunk"));
var _Context = /*#__PURE__*/require("@effect/data/Context");
var _Equal = /*#__PURE__*/require("@effect/data/Equal");
var _Function = /*#__PURE__*/require("@effect/data/Function");
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/List"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Clock = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Clock"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Hub = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Hub"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var RefSynchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref/Synchronized"));
var Schedule = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Schedule"));
var ManagerConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ManagerConfig"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PodAddress"));
var Pods = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Pods"));
var PodsHealth = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PodsHealth"));
var PodWithMetadata = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PodWithMetadata"));
var ShardError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardError"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardId"));
var ShardingEvent = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardingEvent"));
var ShardManagerState = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardManagerState"));
var Storage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Storage"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var _utils = /*#__PURE__*/require("./utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category context
 */
const ShardManager = /*#__PURE__*/(0, _Context.Tag)();
exports.ShardManager = ShardManager;
function make(stateRef, rebalanceSemaphore, eventsHub, healthApi, podApi, stateRepository, config) {
  const getAssignments = (0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.map(_ => _.shards));
  const getShardingEvents = Stream.fromHub(eventsHub);
  function register(pod) {
    return (0, _Function.pipe)(Effect.log("Registering " + PodAddress.show(pod.address) + "@" + pod.version, "Info"), Effect.zipRight(RefSynchronized.updateAndGetEffect(stateRef, state => (0, _Function.pipe)(Effect.flatMap(Effect.clock, _ => _.currentTimeMillis), Effect.map(cdt => ShardManagerState.make(HashMap.set(state.pods, pod.address, PodWithMetadata.make(pod, cdt)), state.shards))))), Effect.zipLeft(Hub.publish(eventsHub, ShardingEvent.PodRegistered(pod.address))), Effect.flatMap(state => Effect.when(rebalance(false), () => HashSet.size(state.unassignedShards) > 0)), Effect.zipRight(Effect.forkDaemon(persistPods)), Effect.asUnit);
  }
  function stateHasPod(podAddress) {
    return (0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.map(_ => HashMap.has(_.pods, podAddress)));
  }
  function notifyUnhealthyPod(podAddress) {
    return (0, _Function.pipe)(Effect.whenEffect((0, _Function.pipe)(Hub.publish(eventsHub, ShardingEvent.PodHealthChecked(podAddress)), Effect.zipRight(Effect.unlessEffect(Effect.zipRight(Effect.log(`${podAddress} is not alive, unregistering`, "Warning"), unregister(podAddress)), healthApi.isAlive(podAddress)))), stateHasPod(podAddress)), Effect.asUnit);
  }
  const checkAllPodsHealth = (0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.map(_ => HashMap.keySet(_.pods)), Effect.flatMap(_ => Effect.forEach(_, notifyUnhealthyPod, {
    concurrency: 4,
    discard: true
  })));
  function unregister(podAddress) {
    const eff = (0, _Function.pipe)(Effect.Do, Effect.zipLeft(Effect.log(`Unregistering ${podAddress}`, "Info")), Effect.bind("unassignments", _ => (0, _Function.pipe)(stateRef, RefSynchronized.modify(state => [(0, _Function.pipe)(state.shards, HashMap.filter(pod => (0, _Equal.equals)(pod)(Option.some(podAddress))), HashMap.keySet), {
      ...state,
      pods: HashMap.remove(state.pods, podAddress),
      shards: HashMap.map(state.shards, _ => (0, _Equal.equals)(_)(Option.some(podAddress)) ? Option.none() : _)
    }]))), Effect.tap(_ => Hub.publish(eventsHub, ShardingEvent.PodUnregistered(podAddress))), Effect.tap(_ => Effect.when(Hub.publish(eventsHub, ShardingEvent.ShardsUnassigned(podAddress, _.unassignments)), () => HashSet.size(_.unassignments) > 0)), Effect.zipLeft(Effect.forkDaemon(persistPods)), Effect.zipLeft(Effect.forkDaemon(rebalance(true))));
    return Effect.asUnit(Effect.whenEffect(eff, stateHasPod(podAddress)));
  }
  function withRetry(zio) {
    return (0, _Function.pipe)(zio, Effect.retry((0, _Function.pipe)(Schedule.spaced(config.persistRetryInterval), Schedule.andThen(Schedule.recurs(config.persistRetryCount)))), Effect.ignore);
  }
  const persistAssignments = withRetry((0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.flatMap(state => stateRepository.saveAssignments(state.shards))));
  const persistPods = withRetry((0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.flatMap(state => stateRepository.savePods(HashMap.map(state.pods, v => v.pod)))));
  function updateShardsState(shards, pod) {
    return RefSynchronized.updateEffect(stateRef, state => {
      if (Option.isSome(pod) && !HashMap.has(state.pods, pod.value)) {
        return Effect.fail(ShardError.PodNoLongerRegistered(pod.value));
      }
      return Effect.succeed({
        ...state,
        shards: (0, _Function.pipe)(state.shards, HashMap.map((assignment, shard) => HashSet.has(shards, shard) ? pod : assignment))
      });
    });
  }
  function rebalance(rebalanceImmediately) {
    const algo1 = (0, _Function.pipe)(Effect.Do, Effect.bind("state", () => RefSynchronized.get(stateRef)), Effect.let("_1", ({
      state
    }) => rebalanceImmediately || HashSet.size(state.unassignedShards) > 0 ? decideAssignmentsForUnassignedShards(state) : decideAssignmentsForUnbalancedShards(state, config.rebalanceRate)), Effect.let("assignments", _ => _._1[0]), Effect.let("unassignments", _ => _._1[1]), Effect.let("areChanges", _ => HashMap.size(_.assignments) > 0 || HashMap.size(_.unassignments) > 0), Effect.tap(_ => Effect.when(Effect.log("Rebalance (rebalanceImmidiately=" + JSON.stringify(rebalanceImmediately) + ")", "Debug"), () => _.areChanges)),
    // ping pods first to make sure they are ready and remove those who aren't
    Effect.bind("failedPingedPods", _ => (0, _Function.pipe)(Effect.forEach(HashSet.union(HashMap.keySet(_.assignments), HashMap.keySet(_.unassignments)), pod => (0, _Function.pipe)(podApi.ping(pod), Effect.timeout(config.pingTimeout), Effect.flatMap(Option.match({
      onNone: () => Effect.fail(1),
      onSome: () => Effect.succeed(2)
    })), Effect.match({
      onFailure: () => Chunk.fromIterable([pod]),
      onSuccess: () => Chunk.empty()
    })), {
      concurrency: "inherit"
    }), Effect.map(Chunk.fromIterable), Effect.map(Chunk.flatten), Effect.map(HashSet.fromIterable))), Effect.let("shardsToRemove", _ => (0, _Function.pipe)(List.fromIterable(_.assignments), List.appendAll(List.fromIterable(_.unassignments)), List.filter(([pod, __]) => HashSet.has(_.failedPingedPods, pod)), List.map(([_, shards]) => List.fromIterable(shards)), List.flatMap(_ => _),
    // TODO: List is missing flatMap
    HashSet.fromIterable)));
    const algo2 = (0, _Function.pipe)(algo1, Effect.let("readyAssignments", _ => (0, _Function.pipe)(_.assignments, HashMap.map(HashSet.difference(_.shardsToRemove)), HashMap.filter(__ => HashSet.size(__) > 0))), Effect.let("readyUnassignments", _ => (0, _Function.pipe)(_.unassignments, HashMap.map(HashSet.difference(_.shardsToRemove)), HashMap.filter(__ => HashSet.size(__) > 0))),
    // do the unassignments first
    Effect.bind("failed", _ => (0, _Function.pipe)(Effect.forEach(_.readyUnassignments, ([pod, shards]) => (0, _Function.pipe)(podApi.unassignShards(pod, shards), Effect.zipRight(updateShardsState(shards, Option.none())), Effect.matchEffect({
      onFailure: () => Effect.succeed([HashSet.fromIterable([pod]), shards]),
      onSuccess: () => (0, _Function.pipe)(Hub.publish(eventsHub, ShardingEvent.ShardsUnassigned(pod, shards)), Effect.as([HashSet.empty(), HashSet.empty()]))
    })), {
      concurrency: "inherit"
    }), Effect.map(Chunk.fromIterable), Effect.map(_ => Chunk.unzip(_)), Effect.map(([pods, shards]) => [Chunk.map(pods, Chunk.fromIterable), Chunk.map(shards, Chunk.fromIterable)]), Effect.map(([pods, shards]) => [HashSet.fromIterable(Chunk.flatten(pods)), HashSet.fromIterable(Chunk.flatten(shards))]))), Effect.let("failedUnassignedPods", _ => _.failed[0]), Effect.let("failedUnassignedShards", _ => _.failed[1]),
    // remove assignments of shards that couldn't be unassigned, as well as faulty pods.
    Effect.let("filteredAssignments", _ => (0, _Function.pipe)(HashMap.removeMany(_.readyAssignments, _.failedUnassignedPods), HashMap.map((shards, __) => HashSet.difference(shards, _.failedUnassignedShards)))),
    // then do the assignments
    Effect.bind("failedAssignedPods", _ => (0, _Function.pipe)(Effect.forEach(_.filteredAssignments, ([pod, shards]) => (0, _Function.pipe)(podApi.assignShards(pod, shards), Effect.zipRight(updateShardsState(shards, Option.some(pod))), Effect.matchEffect({
      onFailure: () => Effect.succeed(Chunk.fromIterable([pod])),
      onSuccess: () => (0, _Function.pipe)(Hub.publish(eventsHub, ShardingEvent.ShardsAssigned(pod, shards)), Effect.as(Chunk.empty()))
    })), {
      concurrency: "inherit"
    }), Effect.map(Chunk.fromIterable), Effect.map(Chunk.flatten), Effect.map(HashSet.fromIterable))), Effect.let("failedPods", _ => HashSet.union(HashSet.union(_.failedPingedPods, _.failedUnassignedPods), _.failedAssignedPods)),
    // check if failing pods are still up
    Effect.tap(_ => Effect.forkDaemon(Effect.forEach(_.failedPods, notifyUnhealthyPod, {
      discard: true
    }))), Effect.tap(_ => Effect.when(Effect.log("Failed to rebalance pods: " + (0, _utils.showHashSet)(PodAddress.show)(_.failedPods) + " failed pinged: " + (0, _utils.showHashSet)(PodAddress.show)(_.failedPingedPods) + " failed assigned: " + (0, _utils.showHashSet)(PodAddress.show)(_.failedAssignedPods) + " failed unassigned: " + (0, _utils.showHashSet)(PodAddress.show)(_.failedUnassignedPods), "Debug"), () => HashSet.size(_.failedPods) > 0)),
    // retry rebalancing later if there was any failure
    Effect.tap(_ => (0, _Function.pipe)(Effect.sleep(config.rebalanceRetryInterval), Effect.zipRight(rebalance(rebalanceImmediately)), Effect.forkDaemon, Effect.when(() => HashSet.size(_.failedPods) > 0 && rebalanceImmediately))),
    // persist state changes to Redis
    Effect.tap(_ => (0, _Function.pipe)(persistAssignments, Effect.forkDaemon, Effect.when(() => _.areChanges))));
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
function decideAssignmentsForUnassignedShards(state) {
  return pickNewPods(List.fromIterable(state.unassignedShards), state, true, 1);
}
/** @internal */
function decideAssignmentsForUnbalancedShards(state, rebalanceRate) {
  // don't do regular rebalance in the middle of a rolling update
  const extraShardsToAllocate = state.allPodsHaveMaxVersion ? (0, _Function.pipe)(state.shardsPerPod, HashMap.flatMap((shards, _) => {
    // count how many extra shards compared to the average
    const extraShards = Math.max(HashSet.size(shards) - state.averageShardsPerPod.value, 0);
    return (0, _Function.pipe)(HashMap.empty(), HashMap.set(_, HashSet.fromIterable(List.take(List.fromIterable(shards), extraShards))));
  }), HashSet.fromIterable, HashSet.map(_ => _[1]), HashSet.flatMap(_ => _)) : HashSet.empty();
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
  const [_, assignments] = (0, _Function.pipe)(List.reduce(shardsToRebalance, [state.shardsPerPod, List.empty()], ([shardsPerPod, assignments], shard) => {
    const unassignedPods = (0, _Function.pipe)(assignments, List.flatMap(([shard, _]) => (0, _Function.pipe)(HashMap.get(state.shards, shard), Option.flatten, Option.toArray, List.fromIterable)));
    // find pod with least amount of shards
    return (0, _Function.pipe)(
    // keep only pods with the max version
    HashMap.filter(shardsPerPod, (_, pod) => {
      const maxVersion = state.maxVersion;
      if (Option.isNone(maxVersion)) return true;
      return (0, _Function.pipe)(HashMap.get(state.pods, pod), Option.map(PodWithMetadata.extractVersion), Option.map(_ => PodWithMetadata.compareVersion(_, maxVersion.value) === 0), Option.getOrElse(() => false));
    }),
    // don't assign too many shards to the same pods, unless we need rebalance immediately
    HashMap.filter((_, pod) => {
      if (rebalanceImmediately) return true;
      return (0, _Function.pipe)(assignments, List.filter(([_, p]) => (0, _Equal.equals)(p)(pod)), List.size) < HashMap.size(state.shards) * rebalanceRate;
    }),
    // don't assign to a pod that was unassigned in the same rebalance
    HashMap.filter((_, pod) => !Option.isSome(List.findFirst(unassignedPods, (0, _Equal.equals)(pod)))), (0, _utils.minByOption)(([_, pods]) => HashSet.size(pods)), Option.match({
      onNone: () => [shardsPerPod, assignments],
      onSome: ([pod, shards]) => {
        const oldPod = Option.flatten(HashMap.get(state.shards, shard));
        // if old pod is same as new pod, don't change anything
        if ((0, _Equal.equals)(oldPod)(pod)) {
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
    }));
  }));
  const unassignments = List.flatMap(assignments, ([shard, _]) => (0, _Function.pipe)(Option.flatten(HashMap.get(state.shards, shard)), Option.map(_ => [shard, _]), Option.match({
    onNone: List.empty,
    onSome: List.of
  })));
  const assignmentsPerPod = (0, _Function.pipe)(assignments, (0, _utils.groupBy)(([_, pod]) => pod), HashMap.map(HashSet.map(([shardId, _]) => shardId)));
  const unassignmentsPerPod = (0, _Function.pipe)(unassignments, (0, _utils.groupBy)(([_, pod]) => pod), HashMap.map(HashSet.map(([shardId, _]) => shardId)));
  return [assignmentsPerPod, unassignmentsPerPod];
}
const live0 = /*#__PURE__*/(0, _Function.pipe)(Effect.Do, /*#__PURE__*/Effect.bind("config", _ => ManagerConfig.ManagerConfig), /*#__PURE__*/Effect.bind("stateRepository", _ => Storage.Storage), /*#__PURE__*/Effect.bind("healthApi", _ => PodsHealth.PodsHealth), /*#__PURE__*/Effect.bind("podApi", _ => Pods.Pods), /*#__PURE__*/Effect.bind("pods", _ => _.stateRepository.getPods), /*#__PURE__*/Effect.bind("assignments", _ => _.stateRepository.getAssignments),
/*#__PURE__*/
// remove unhealthy pods on startup
Effect.bind("filteredPods", _ => (0, _Function.pipe)(Effect.filter(_.pods, ([podAddress]) => _.healthApi.isAlive(podAddress), {
  concurrency: "inherit"
}), Effect.map(HashMap.fromIterable))), /*#__PURE__*/Effect.let("filteredAssignments", _ => (0, _Function.pipe)(HashMap.filter(_.assignments, pod => Option.isSome(pod) && HashMap.has(_.filteredPods, pod.value)))), /*#__PURE__*/Effect.bind("cdt", _ => Clock.currentTimeMillis), /*#__PURE__*/Effect.let("initialState", _ => ShardManagerState.make(HashMap.map(_.filteredPods, pod => PodWithMetadata.make(pod, _.cdt)), HashMap.union(_.filteredAssignments, (0, _Function.pipe)(Chunk.range(1, _.config.numberOfShards), Chunk.map(n => [ShardId.make(n), Option.none()]), HashMap.fromIterable)))));
const live1 = /*#__PURE__*/(0, _Function.pipe)(live0, /*#__PURE__*/Effect.bind("state", _ => RefSynchronized.make(_.initialState)), /*#__PURE__*/Effect.bind("rebalanceSemaphore", _ => Effect.makeSemaphore(1)), /*#__PURE__*/Effect.bind("eventsHub", _ => Hub.unbounded()), /*#__PURE__*/Effect.let("shardManager", _ => make(_.state, _.rebalanceSemaphore, _.eventsHub, _.healthApi, _.podApi, _.stateRepository, _.config)), /*#__PURE__*/Effect.tap(_ => Effect.forkDaemon(_.shardManager.persistPods)),
/*#__PURE__*/
// rebalance immediately if there are unassigned shards
Effect.tap(_ => _.shardManager.rebalance(HashSet.size(_.initialState.unassignedShards) > 0)),
/*#__PURE__*/
// start a regular rebalance at the given interval
Effect.tap(_ => (0, _Function.pipe)(_.shardManager.rebalance(false), Effect.repeat(Schedule.spaced(_.config.rebalanceInterval)), Effect.forkDaemon)), /*#__PURE__*/Effect.tap(_ => (0, _Function.pipe)(_.shardManager.getShardingEvents, Stream.mapEffect(_ => Effect.log(JSON.stringify(_), "Info")), Stream.runDrain, Effect.forkDaemon)), /*#__PURE__*/Effect.tap(_ => Effect.log("Shard Manager loaded", "Info")), /*#__PURE__*/Effect.map(_ => _.shardManager));
/**
 * @since 1.0.0
 * @category layers
 */
const live = /*#__PURE__*/Layer.effect(ShardManager, live1);
exports.live = live;
//# sourceMappingURL=ShardManager.js.map