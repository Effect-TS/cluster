"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShardManager = void 0;
exports.decideAssignmentsForUnassignedShards = decideAssignmentsForUnassignedShards;
exports.decideAssignmentsForUnbalancedShards = decideAssignmentsForUnbalancedShards;
exports.live = void 0;
var ManagerConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ManagerConfig"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PodAddress"));
var Pods = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Pods"));
var PodsHealth = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PodsHealth"));
var PodWithMetadata = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PodWithMetadata"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardId"));
var _ShardingError = /*#__PURE__*/require("@effect/cluster/ShardingError");
var ShardingEvent = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardingEvent"));
var ShardManagerState = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardManagerState"));
var Storage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Storage"));
var Chunk = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Chunk"));
var Clock = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Clock"));
var _Context = /*#__PURE__*/require("effect/Context");
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var _Equal = /*#__PURE__*/require("effect/Equal");
var _Function = /*#__PURE__*/require("effect/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashSet"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/List"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Option"));
var PubSub = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/PubSub"));
var Schedule = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Schedule"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Stream"));
var RefSynchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/SynchronizedRef"));
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
function make(layerScope, stateRef, rebalanceSemaphore, eventsHub, healthApi, podApi, stateRepository, config) {
  const getAssignments = (0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.map(_ => _.shards));
  const getShardingEvents = Stream.fromPubSub(eventsHub);
  function register(pod) {
    return (0, _Function.pipe)(Effect.logInfo("Registering " + PodAddress.show(pod.address) + "@" + pod.version), Effect.zipRight(RefSynchronized.updateAndGetEffect(stateRef, state => (0, _Function.pipe)(Effect.flatMap(Effect.clock, _ => _.currentTimeMillis), Effect.map(cdt => ShardManagerState.make(HashMap.set(state.pods, pod.address, PodWithMetadata.make(pod, cdt)), state.shards))))), Effect.zipLeft(PubSub.publish(eventsHub, ShardingEvent.PodRegistered(pod.address))), Effect.flatMap(state => Effect.when(rebalance(false), () => HashSet.size(state.unassignedShards) > 0)), Effect.zipRight(Effect.forkIn(layerScope)(persistPods)), Effect.asUnit);
  }
  function stateHasPod(podAddress) {
    return (0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.map(_ => HashMap.has(_.pods, podAddress)));
  }
  function notifyUnhealthyPod(podAddress) {
    return (0, _Function.pipe)(Effect.whenEffect((0, _Function.pipe)(PubSub.publish(eventsHub, ShardingEvent.PodHealthChecked(podAddress)), Effect.zipRight(Effect.unlessEffect(Effect.zipRight(Effect.logWarning(`${podAddress} is not alive, unregistering`), unregister(podAddress)), healthApi.isAlive(podAddress)))), stateHasPod(podAddress)), Effect.asUnit);
  }
  const checkAllPodsHealth = (0, _Function.pipe)(RefSynchronized.get(stateRef), Effect.map(_ => HashMap.keySet(_.pods)), Effect.flatMap(_ => Effect.forEach(_, notifyUnhealthyPod, {
    concurrency: 4,
    discard: true
  })));
  function unregister(podAddress) {
    const eff = (0, _Function.pipe)(Effect.Do, Effect.zipLeft(Effect.logInfo(`Unregistering ${podAddress}`)), Effect.bind("unassignments", _ => (0, _Function.pipe)(stateRef, RefSynchronized.modify(state => [(0, _Function.pipe)(state.shards, HashMap.filter(pod => (0, _Equal.equals)(pod)(Option.some(podAddress))), HashMap.keySet), {
      ...state,
      pods: HashMap.remove(state.pods, podAddress),
      shards: HashMap.map(state.shards, _ => (0, _Equal.equals)(_)(Option.some(podAddress)) ? Option.none() : _)
    }]))), Effect.tap(_ => PubSub.publish(eventsHub, ShardingEvent.PodUnregistered(podAddress))), Effect.tap(_ => Effect.when(PubSub.publish(eventsHub, ShardingEvent.ShardsUnassigned(podAddress, _.unassignments)), () => HashSet.size(_.unassignments) > 0)), Effect.zipLeft(Effect.forkIn(layerScope)(persistPods)), Effect.zipLeft(Effect.forkIn(layerScope)(rebalance(true))));
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
        return Effect.fail((0, _ShardingError.ShardingErrorPodNoLongerRegistered)(pod.value));
      }
      return Effect.succeed({
        ...state,
        shards: (0, _Function.pipe)(state.shards, HashMap.map((assignment, shard) => HashSet.has(shards, shard) ? pod : assignment))
      });
    });
  }
  function rebalance(rebalanceImmediately) {
    const algo = Effect.gen(function* (_) {
      const state = yield* _(RefSynchronized.get(stateRef));
      const [assignments, unassignments] = rebalanceImmediately || HashSet.size(state.unassignedShards) > 0 ? decideAssignmentsForUnassignedShards(state) : decideAssignmentsForUnbalancedShards(state, config.rebalanceRate);
      const areChanges = HashMap.size(assignments) > 0 || HashMap.size(unassignments) > 0;
      if (areChanges) {
        yield* _(Effect.logDebug("Rebalance (rebalanceImmidiately=" + JSON.stringify(rebalanceImmediately) + ")"));
      }
      const failedPingedPods = yield* _(Effect.forEach(HashSet.union(HashMap.keySet(assignments), HashMap.keySet(unassignments)), pod => (0, _Function.pipe)(podApi.ping(pod), Effect.timeout(config.pingTimeout), Effect.flatMap(Option.match({
        onNone: () => Effect.fail(1),
        onSome: () => Effect.succeed(2)
      })), Effect.match({
        onFailure: () => Chunk.fromIterable([pod]),
        onSuccess: () => Chunk.empty()
      })), {
        concurrency: "inherit"
      }), Effect.map(Chunk.fromIterable), Effect.map(Chunk.flatten), Effect.map(HashSet.fromIterable));
      const shardsToRemove = (0, _Function.pipe)(List.fromIterable(assignments), List.appendAll(List.fromIterable(unassignments)), List.filter(([pod, __]) => HashSet.has(failedPingedPods, pod)), List.map(([_, shards]) => List.fromIterable(shards)), List.flatMap(_ => _),
      // TODO: List is missing flatMap
      HashSet.fromIterable);
      const readyAssignments = (0, _Function.pipe)(assignments, HashMap.map(HashSet.difference(shardsToRemove)), HashMap.filter(__ => HashSet.size(__) > 0));
      const readyUnassignments = (0, _Function.pipe)(unassignments, HashMap.map(HashSet.difference(shardsToRemove)), HashMap.filter(__ => HashSet.size(__) > 0));
      const [failedUnassignedPods, failedUnassignedShards] = yield* _(Effect.forEach(readyUnassignments, ([pod, shards]) => (0, _Function.pipe)(podApi.unassignShards(pod, shards), Effect.zipRight(updateShardsState(shards, Option.none())), Effect.matchEffect({
        onFailure: () => Effect.succeed([HashSet.fromIterable([pod]), shards]),
        onSuccess: () => (0, _Function.pipe)(PubSub.publish(eventsHub, ShardingEvent.ShardsUnassigned(pod, shards)), Effect.as([HashSet.empty(), HashSet.empty()]))
      })), {
        concurrency: "inherit"
      }), Effect.map(Chunk.fromIterable), Effect.map(_ => Chunk.unzip(_)), Effect.map(([pods, shards]) => [Chunk.map(pods, Chunk.fromIterable), Chunk.map(shards, Chunk.fromIterable)]), Effect.map(([pods, shards]) => [HashSet.fromIterable(Chunk.flatten(pods)), HashSet.fromIterable(Chunk.flatten(shards))]));
      // remove assignments of shards that couldn't be unassigned, as well as faulty pods.
      const filteredAssignments = (0, _Function.pipe)(HashMap.removeMany(readyAssignments, failedUnassignedPods), HashMap.map((shards, __) => HashSet.difference(shards, failedUnassignedShards)));
      // then do the assignments
      const failedAssignedPods = yield* _(Effect.forEach(filteredAssignments, ([pod, shards]) => (0, _Function.pipe)(podApi.assignShards(pod, shards), Effect.zipRight(updateShardsState(shards, Option.some(pod))), Effect.matchEffect({
        onFailure: () => Effect.succeed(Chunk.fromIterable([pod])),
        onSuccess: () => (0, _Function.pipe)(PubSub.publish(eventsHub, ShardingEvent.ShardsAssigned(pod, shards)), Effect.as(Chunk.empty()))
      })), {
        concurrency: "inherit"
      }), Effect.map(Chunk.fromIterable), Effect.map(Chunk.flatten), Effect.map(HashSet.fromIterable));
      const failedPods = HashSet.union(HashSet.union(failedPingedPods, failedUnassignedPods), failedAssignedPods);
      // check if failing pods are still up
      yield* _(Effect.forkIn(layerScope)(Effect.forEach(failedPods, notifyUnhealthyPod, {
        discard: true
      })));
      if (HashSet.size(failedPods) > 0) {
        yield* _(Effect.logDebug("Failed to rebalance pods: " + (0, _utils.showHashSet)(PodAddress.show)(failedPods) + " failed pinged: " + (0, _utils.showHashSet)(PodAddress.show)(failedPingedPods) + " failed assigned: " + (0, _utils.showHashSet)(PodAddress.show)(failedAssignedPods) + " failed unassigned: " + (0, _utils.showHashSet)(PodAddress.show)(failedUnassignedPods)));
      }
      // retry rebalancing later if there was any failure
      if (HashSet.size(failedPods) > 0 && rebalanceImmediately) {
        yield* _(Effect.sleep(config.rebalanceRetryInterval), Effect.zipRight(rebalance(rebalanceImmediately)), Effect.forkIn(layerScope));
      }
      // persist state changes to Redis
      if (areChanges) {
        yield* _(Effect.forkIn(layerScope)(persistAssignments));
      }
    });
    return rebalanceSemaphore.withPermits(1)(algo);
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
/**
 * @since 1.0.0
 */
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
/**
 * @since 1.0.0
 * @category layers
 */
const live = /*#__PURE__*/Effect.gen(function* (_) {
  const config = yield* _(ManagerConfig.ManagerConfig);
  const stateRepository = yield* _(Storage.Storage);
  const healthApi = yield* _(PodsHealth.PodsHealth);
  const podsApi = yield* _(Pods.Pods);
  const layerScope = yield* _(Effect.scope);
  const pods = yield* _(stateRepository.getPods);
  const assignments = yield* _(stateRepository.getAssignments);
  const filteredPods = yield* _(Effect.filter(pods, ([podAddress]) => healthApi.isAlive(podAddress), {
    concurrency: "inherit"
  }), Effect.map(HashMap.fromIterable));
  const filteredAssignments = HashMap.filter(assignments, pod => Option.isSome(pod) && HashMap.has(filteredPods, pod.value));
  const cdt = yield* _(Clock.currentTimeMillis);
  const initialState = ShardManagerState.make(HashMap.map(filteredPods, pod => PodWithMetadata.make(pod, cdt)), HashMap.union(filteredAssignments, (0, _Function.pipe)(Chunk.range(1, config.numberOfShards), Chunk.map(n => [ShardId.make(n), Option.none()]), HashMap.fromIterable)));
  const state = yield* _(RefSynchronized.make(initialState));
  const rebalanceSemaphore = yield* _(Effect.makeSemaphore(1));
  const eventsHub = yield* _(PubSub.unbounded());
  const shardManager = make(layerScope, state, rebalanceSemaphore, eventsHub, healthApi, podsApi, stateRepository, config);
  yield* _(Effect.forkIn(layerScope)(shardManager.persistPods));
  // rebalance immediately if there are unassigned shards
  yield* _(shardManager.rebalance(HashSet.size(initialState.unassignedShards) > 0));
  // start a regular rebalance at the given interval
  yield* _(shardManager.rebalance(false), Effect.repeat(Schedule.spaced(config.rebalanceInterval)), Effect.forkIn(layerScope));
  // log info events
  yield* _(shardManager.getShardingEvents, Stream.mapEffect(_ => Effect.logInfo(JSON.stringify(_))), Stream.runDrain, Effect.forkIn(layerScope));
  yield* _(Effect.logInfo("Shard Manager loaded"));
  return shardManager;
}).pipe( /*#__PURE__*/Layer.scoped(ShardManager));
exports.live = live;
//# sourceMappingURL=ShardManager.js.map