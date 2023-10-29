"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inMemory = exports.TypeId = void 0;
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var Queue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Queue"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/cluster/MessageQueueInstance";
/**
 * A layer that creates an in-memory message queue.
 *
 * @since 1.0.0
 * @category layers
 */
exports.TypeId = TypeId;
const inMemory = () => Effect.gen(function* (_) {
  const queue = yield* _(Queue.unbounded());
  return {
    offer: msg => Queue.offer(queue, msg),
    dequeue: queue,
    shutdown: Queue.shutdown(queue)
  };
});
exports.inMemory = inMemory;
//# sourceMappingURL=MessageQueue.js.map