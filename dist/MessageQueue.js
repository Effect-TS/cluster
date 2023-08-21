"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inMemory = exports.TypeId = exports.MessageQueue = void 0;
var _Context = /*#__PURE__*/require("@effect/data/Context");
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Queue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Queue"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/shardcake/MessageQueueInstance";
/**
 * @since 1.0.0
 * @category context
 */
exports.TypeId = TypeId;
const MessageQueue = /*#__PURE__*/(0, _Context.Tag)();
/**
 * A layer that creates an in-memory message queue.
 *
 * @since 1.0.0
 * @category layers
 */
exports.MessageQueue = MessageQueue;
const inMemory = /*#__PURE__*/Layer.succeed(MessageQueue, {
  _id: TypeId,
  make: () => Effect.gen(function* (_) {
    const queue = yield* _(Queue.unbounded());
    yield* _(Effect.addFinalizer(() => Queue.shutdown(queue)));
    return {
      offer: msg => Queue.offer(queue, msg),
      dequeue: queue
    };
  })
});
exports.inMemory = inMemory;
//# sourceMappingURL=MessageQueue.js.map