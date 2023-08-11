"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.isStreamMessage = isStreamMessage;
exports.schema = schema;
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Data"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var StreamReplier = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/StreamReplier"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/StreamMessage");
/**
 * @since 1.0.0
 * @category utils
 */
exports.TypeId = TypeId;
function isStreamMessage(value) {
  return typeof value === "object" && value !== null && "replier" in value && StreamReplier.isStreamReplier(value.replier);
}
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
function schema(success) {
  return function (item) {
    const result = Schema.extend(Schema.struct({
      replier: StreamReplier.schema(success)
    }))(item);
    const make = arg => replyId => Data.struct({
      ...arg,
      replier: StreamReplier.streamReplier(replyId, success)
    });
    return [result, make];
  };
}
//# sourceMappingURL=StreamMessage.js.map