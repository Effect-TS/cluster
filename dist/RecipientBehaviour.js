"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.dequeue = dequeue;
exports.onReceive = onReceive;
exports.process = process;
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var PoisonPill = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PoisonPill"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/shardcake/ByteArray";
/**
 * @since 1.0.0
 * @category constructors
 */
exports.TypeId = TypeId;
function dequeue(schema, dequeue) {
  return {
    _id: TypeId,
    schema: schema,
    dequeue,
    accept: () => Effect.unit
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function process(schema, process) {
  return {
    _id: TypeId,
    schema: schema,
    dequeue: (entityId, dequeue) => Effect.forever(Effect.flatMap(msg => process(entityId, msg))(PoisonPill.takeOrInterrupt(dequeue))),
    accept: () => Effect.unit
  };
}
/**
 * @since 1.0.0
 * @category utils
 */
function onReceive(accept) {
  return recipientBehaviour => ({
    ...recipientBehaviour,
    accept: msg => accept(msg, recipientBehaviour.accept)
  });
}
//# sourceMappingURL=RecipientBehaviour.js.map