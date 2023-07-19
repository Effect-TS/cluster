"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.fromDeferred = fromDeferred;
exports.fromQueue = fromQueue;
exports.isReplyChannel = isReplyChannel;
exports.isReplyChannelFromDeferred = isReplyChannelFromDeferred;
exports.isReplyChannelFromQueue = isReplyChannelFromQueue;
exports.stream = exports.single = void 0;
var _Function = /*#__PURE__*/require("@effect/data/Function");
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Deferred = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Deferred"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Exit = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Exit"));
var Queue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Queue"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var Take = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Take"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/shardcake/ReplyChannel";
/** @internal */
exports.TypeId = TypeId;
function isReplyChannel(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/** @internal */
function isReplyChannelFromQueue(value) {
  return isReplyChannel(value) && "_tag" in value && value["_tag"] === "FromQueue";
}
/** @internal */
function isReplyChannelFromDeferred(value) {
  return isReplyChannel(value) && "_tag" in value && value["_tag"] === "FromDeferred";
}
/**
 * Construct a new `ReplyChannel` from a queue.
 *
 * @internal
 */
function fromQueue(queue) {
  const end = (0, _Function.pipe)(Queue.offer(queue, Take.end), Effect.exit, Effect.asUnit);
  const fail = cause => (0, _Function.pipe)(Queue.offer(queue, Take.failCause(cause)), Effect.exit, Effect.asUnit);
  const await_ = Queue.awaitShutdown(queue);
  return {
    _id: TypeId,
    _tag: "FromQueue",
    await: await_,
    end,
    fail,
    replySingle: a => (0, _Function.pipe)(Queue.offer(queue, Take.of(a)), Effect.exit, Effect.zipRight(end)),
    replyStream: stream => (0, _Function.pipe)(Stream.runForEach(stream, a => Queue.offer(queue, Take.of(a))), Effect.onExit(_ => Queue.offer(queue, Exit.match(_, {
      onFailure: e => Take.failCause(e),
      onSuccess: () => Take.end
    }))), Effect.race(await_), Effect.fork, Effect.asUnit),
    output: (0, _Function.pipe)(Stream.fromQueueWithShutdown(queue), Stream.flattenTake, Stream.onError(fail))
  };
}
/**
 * Construct a new `ReplyChannel` from a deferred.
 *
 * @internal
 */
function fromDeferred(deferred) {
  const end = (0, _Function.pipe)(Deferred.succeed(deferred, Option.none()), Effect.asUnit);
  const fail = cause => (0, _Function.pipe)(Deferred.failCause(deferred, cause), Effect.asUnit);
  return {
    _id: TypeId,
    _tag: "FromDeferred",
    await: (0, _Function.pipe)(Deferred.await(deferred), Effect.exit, Effect.asUnit),
    end,
    fail,
    replySingle: a => (0, _Function.pipe)(Deferred.succeed(deferred, Option.some(a)), Effect.asUnit),
    replyStream: stream => (0, _Function.pipe)(Stream.runHead(stream), Effect.flatMap(_ => Deferred.succeed(deferred, _)), Effect.catchAllCause(fail), Effect.fork, Effect.asUnit),
    output: (0, _Function.pipe)(Deferred.await(deferred), Effect.onError(fail))
  };
}
/** @internal */
const single = () => (0, _Function.pipe)(Deferred.make(), Effect.map(fromDeferred));
/** @internal */
exports.single = single;
const stream = () => (0, _Function.pipe)(Queue.unbounded(), Effect.map(fromQueue));
exports.stream = stream;
//# sourceMappingURL=ReplyChannel.js.map