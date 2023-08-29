"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  schema: true
};
exports.schema = void 0;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var _ShardingErrorEntityNotManagedByThisPod = /*#__PURE__*/require("@effect/sharding/ShardingErrorEntityNotManagedByThisPod");
Object.keys(_ShardingErrorEntityNotManagedByThisPod).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingErrorEntityNotManagedByThisPod[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingErrorEntityNotManagedByThisPod[key];
    }
  });
});
var _ShardingErrorEntityTypeNotRegistered = /*#__PURE__*/require("@effect/sharding/ShardingErrorEntityTypeNotRegistered");
Object.keys(_ShardingErrorEntityTypeNotRegistered).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingErrorEntityTypeNotRegistered[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingErrorEntityTypeNotRegistered[key];
    }
  });
});
var _ShardingErrorMessageQueue = /*#__PURE__*/require("@effect/sharding/ShardingErrorMessageQueue");
Object.keys(_ShardingErrorMessageQueue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingErrorMessageQueue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingErrorMessageQueue[key];
    }
  });
});
var _ShardingErrorPodNoLongerRegistered = /*#__PURE__*/require("@effect/sharding/ShardingErrorPodNoLongerRegistered");
Object.keys(_ShardingErrorPodNoLongerRegistered).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingErrorPodNoLongerRegistered[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingErrorPodNoLongerRegistered[key];
    }
  });
});
var _ShardingErrorPodUnavailable = /*#__PURE__*/require("@effect/sharding/ShardingErrorPodUnavailable");
Object.keys(_ShardingErrorPodUnavailable).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingErrorPodUnavailable[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingErrorPodUnavailable[key];
    }
  });
});
var _ShardingErrorSendTimeout = /*#__PURE__*/require("@effect/sharding/ShardingErrorSendTimeout");
Object.keys(_ShardingErrorSendTimeout).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingErrorSendTimeout[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingErrorSendTimeout[key];
    }
  });
});
var _ShardingErrorSerialization = /*#__PURE__*/require("@effect/sharding/ShardingErrorSerialization");
Object.keys(_ShardingErrorSerialization).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ShardingErrorSerialization[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShardingErrorSerialization[key];
    }
  });
});
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category schema
 */
const schema = /*#__PURE__*/Schema.union(_ShardingErrorSerialization.ShardingErrorSerializationSchema, _ShardingErrorEntityNotManagedByThisPod.ShardingErrorEntityNotManagedByThisPodSchema, _ShardingErrorEntityTypeNotRegistered.ShardingErrorEntityTypeNotRegisteredSchema, _ShardingErrorMessageQueue.ShardingErrorMessageQueueSchema, _ShardingErrorPodNoLongerRegistered.ShardingErrorPodNoLongerRegisteredSchema, _ShardingErrorPodUnavailable.ShardingErrorPodUnavailableSchema, _ShardingErrorSendTimeout.ShardingErrorSendTimeoutSchema);
exports.schema = schema;
//# sourceMappingURL=ShardingError.js.map