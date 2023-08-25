"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = make;
var _Equal = /*#__PURE__*/require("@effect/data/Equal");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/List"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var PodWithMetadata = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/PodWithMetadata"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardId"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category constructors
 */
function make(pods, shards) {
  const podVersions = List.map(PodWithMetadata.extractVersion)(List.fromIterable(HashMap.values(pods)));
  const maxVersion = (result => List.size(result) === 0 ? Option.none() : Option.some(result))(List.reduce(List.empty(), (curr, a) => PodWithMetadata.compareVersion(curr, a) === -1 ? a : curr)(podVersions));
  const shardsPerPodPods = HashMap.reduce(shards, HashMap.empty(), (curr, optionPod, shardId) => {
    if (Option.isNone(optionPod)) return curr;
    if (HashMap.has(curr, optionPod.value)) {
      return HashMap.modify(curr, optionPod.value, HashSet.add(shardId));
    } else {
      return HashMap.set(curr, optionPod.value, HashSet.fromIterable([shardId]));
    }
  });
  const shardsPerPod = HashMap.union(shardsPerPodPods)(HashMap.map(pods, () => HashSet.empty()));
  const allPodsHaveMaxVersion = List.every(podVersions, _ => (0, _Equal.equals)(Option.some(_))(maxVersion));
  return {
    pods,
    shards,
    unassignedShards: HashSet.map(([k, _]) => k)(HashSet.fromIterable(HashMap.filter(shards, (a, _) => Option.isNone(a)))),
    averageShardsPerPod: HashMap.isEmpty(pods) ? ShardId.make(0) : ShardId.make(HashMap.size(shards) / HashMap.size(pods)),
    shardsPerPod,
    maxVersion,
    allPodsHaveMaxVersion
  };
}
//# sourceMappingURL=ShardManagerState.js.map