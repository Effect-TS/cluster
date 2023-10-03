"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendStreamAutoRestart = sendStreamAutoRestart;
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingError"));
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Duration"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var Either = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Either"));
var _Function = /*#__PURE__*/require("effect/Function");
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Stream"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * Send a message and receive a stream of responses of type `Res` while restarting the stream when the remote entity
 * is rebalanced.
 *
 * To do so, we need a "cursor" so the stream of responses can be restarted where it ended before the rebalance. That
 * is, the first message sent to the remote entity contains the given initial cursor value and we extract an updated
 * cursor from the responses so that when the remote entity is rebalanced, a new message can be sent with the right
 * cursor according to what we've seen in the previous stream of responses.
 * @since 1.0.0
 */
function sendStreamAutoRestart(messenger, entityId, cursor) {
  return fn => updateCursor => {
    return (0, _Function.pipe)(Stream.unwrap(messenger.sendStream(entityId)(fn(cursor))), Stream.either, Stream.mapAccum(cursor, (c, either) => Either.match(either, {
      onLeft: err => [c, Either.left([c, err])],
      onRight: res => [updateCursor(c, res), Either.right(res)]
    })), Stream.flatMap(Either.match({
      onRight: res => Stream.succeed(res),
      onLeft: ([cursor, err]) => ShardingError.isShardingErrorPodUnavailable(err) ? (0, _Function.pipe)(Effect.sleep(Duration.millis(200)), Stream.fromEffect, Stream.zipRight(sendStreamAutoRestart(messenger, entityId, cursor)(fn)(updateCursor))) : Stream.fail(err)
    })));
  };
}
//# sourceMappingURL=Messenger.js.map