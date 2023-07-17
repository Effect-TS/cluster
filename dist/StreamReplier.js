"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.isStreamReplier = isStreamReplier;
exports.streamReplier = exports.schema = void 0;
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var ReplyId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ReplyId"));
var Sharding = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Sharding"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/shardcake/StreamReplier";
/**
 * @since 1.0.0
 * @category constructors
 */
exports.TypeId = TypeId;
const streamReplier = (id, schema) => {
  const self = {
    [TypeId]: {},
    id,
    schema,
    reply: reply => Effect.flatMap(Sharding.Sharding, _ => _.replyStream(reply, self))
  };
  return self;
};
/** @internal */
exports.streamReplier = streamReplier;
function isStreamReplier(value) {
  return typeof value === "object" && value !== null && TypeId in value;
}
/**
 * @since 1.0.0
 * @category schema
 */
const schema = schema => {
  return Schema.transform(ReplyId.schema, Schema.unknown, id => streamReplier(id, schema), _ => {
    return _.id;
  });
};
exports.schema = schema;
//# sourceMappingURL=StreamReplier.js.map