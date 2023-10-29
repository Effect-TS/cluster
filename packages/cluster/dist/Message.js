"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMessage = isMessage;
exports.schema = schema;
var Replier = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Replier"));
var ReplyId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ReplyId"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Data"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var _Function = /*#__PURE__*/require("effect/Function");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category utils
 */
function isMessage(value) {
  return typeof value === "object" && value !== null && "replier" in value && Replier.isReplier(value.replier);
}
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
function schema(replySchema) {
  return function (item) {
    const result = (0, _Function.pipe)(item, Schema.extend(Schema.struct({
      replier: Replier.schema(replySchema)
    })));
    const make = (arg, replyId) => Data.struct({
      ...arg,
      replier: Replier.replier(replyId, replySchema)
    });
    const makeEffect = arg => (0, _Function.pipe)(ReplyId.makeEffect, Effect.map(replyId => make(arg, replyId)));
    return {
      ...result,
      make,
      makeEffect
    };
  };
}
//# sourceMappingURL=Message.js.map