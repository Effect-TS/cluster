"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShardingSendTimeoutError = ShardingSendTimeoutError;
exports.ShardingSendTimeoutErrorTag = exports.ShardingSendTimeoutErrorSchema = void 0;
exports.isShardingSendTimeoutError = isShardingSendTimeoutError;
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Data"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category schema
 */
const ShardingSendTimeoutErrorTag = "@effect/shardcake/ShardingSendTimeoutError";
exports.ShardingSendTimeoutErrorTag = ShardingSendTimeoutErrorTag;
const ShardingSendTimeoutErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingSendTimeoutErrorTag)
}));
/**
 * @since 1.0.0
 * @category constructors
 */
function ShardingSendTimeoutError() {
  return Data.struct({
    _tag: ShardingSendTimeoutErrorTag
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
function isShardingSendTimeoutError(value) {
  return value && "_tag" in value && value._tag === ShardingSendTimeoutErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
const ShardingSendTimeoutErrorSchema = ShardingSendTimeoutErrorSchema_;
exports.ShardingSendTimeoutErrorSchema = ShardingSendTimeoutErrorSchema;
//# sourceMappingURL=ShardingSendTimeoutError.js.map