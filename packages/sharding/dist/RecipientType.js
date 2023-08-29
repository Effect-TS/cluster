"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getShardId = void 0;
exports.makeEntityType = makeEntityType;
exports.makeTopicType = makeTopicType;
var Hash = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Hash"));
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
function makeEntityType(name, schema) {
  return {
    _tag: "EntityType",
    name,
    schema: schema
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function makeTopicType(name, schema) {
  return {
    _tag: "TopicType",
    name,
    schema: schema
  };
}
/**
 * Gets the shard id where this entity should run.
 * @since 1.0.0
 * @category utils
 */
const getShardId = (entityId, numberOfShards) => ShardId.make(Math.abs(Hash.string(entityId) % numberOfShards) + 1);
exports.getShardId = getShardId;
//# sourceMappingURL=RecipientType.js.map