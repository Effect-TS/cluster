"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ShardingErrorSchema: true
};
exports.ShardingErrorSchema = void 0;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var _ShardingDecodeError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingDecodeError");
Object.keys(_ShardingDecodeError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingDecodeError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingDecodeError[key];
    }
  });
});
var _ShardingEncodeError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingEncodeError");
Object.keys(_ShardingEncodeError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingEncodeError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingEncodeError[key];
    }
  });
});
var _ShardingEntityNotManagedByThisPodError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError");
Object.keys(_ShardingEntityNotManagedByThisPodError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingEntityNotManagedByThisPodError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingEntityNotManagedByThisPodError[key];
    }
  });
});
var _ShardingEntityTypeNotRegisteredError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError");
Object.keys(_ShardingEntityTypeNotRegisteredError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingEntityTypeNotRegisteredError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingEntityTypeNotRegisteredError[key];
    }
  });
});
var _ShardingMessageQueueOfferError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingMessageQueueOfferError");
Object.keys(_ShardingMessageQueueOfferError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingMessageQueueOfferError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingMessageQueueOfferError[key];
    }
  });
});
var _ShardingPodNoLongerRegisteredError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError");
Object.keys(_ShardingPodNoLongerRegisteredError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingPodNoLongerRegisteredError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingPodNoLongerRegisteredError[key];
    }
  });
});
var _ShardingPodUnavailableError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingPodUnavailableError");
Object.keys(_ShardingPodUnavailableError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingPodUnavailableError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingPodUnavailableError[key];
    }
  });
});
var _ShardingReplyError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingReplyError");
Object.keys(_ShardingReplyError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingReplyError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingReplyError[key];
    }
  });
});
var _ShardingSendError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingSendError");
Object.keys(_ShardingSendError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingSendError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingSendError[key];
    }
  });
});
var _ShardingSendTimeoutError = /*#__PURE__*/require("@effect/shardcake/ShardingError/ShardingSendTimeoutError");
Object.keys(_ShardingSendTimeoutError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingSendTimeoutError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingSendTimeoutError[key];
    }
  });
});
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 * @category schema
 */
const ShardingErrorSchema = /*#__PURE__*/Schema.union(_ShardingDecodeError.ShardingDecodeErrorSchema, _ShardingEncodeError.ShardingEncodeErrorSchema, _ShardingEntityNotManagedByThisPodError.ShardingEntityNotManagedByThisPodErrorSchema, _ShardingEntityTypeNotRegisteredError.ShardingEntityTypeNotRegisteredErrorSchema, _ShardingMessageQueueOfferError.ShardingMessageQueueOfferErrorSchema, _ShardingPodNoLongerRegisteredError.ShardingPodNoLongerRegisteredErrorSchema, _ShardingPodUnavailableError.ShardingPodUnavailableErrorSchema, _ShardingReplyError.ShardingReplyErrorSchema, _ShardingSendError.ShardingSendErrorSchema, _ShardingSendTimeoutError.ShardingSendTimeoutErrorSchema);
exports.ShardingErrorSchema = ShardingErrorSchema;
//# sourceMappingURL=index.js.map