"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchError = FetchError;
exports.isFetchError = isFetchError;
exports.jsonParse = jsonParse;
exports.jsonStringify = jsonStringify;
exports.send = send;
exports.sendInternal = sendInternal;
exports.sendStream = sendStream;
exports.stringFromUint8ArrayString = stringFromUint8ArrayString;
exports.uint8ArrayFromStringStream = uint8ArrayFromStringStream;
var Chunk = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Chunk"));
var _Function = /*#__PURE__*/require("effect/Function");
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var TreeFormatter = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/TreeFormatter"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingError"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Stream"));
var _nodeFetch = /*#__PURE__*/_interopRequireDefault( /*#__PURE__*/require("node-fetch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 * @internal
 */

/** @internal */
function FetchError(url, body, error) {
  return {
    _tag: "FetchError",
    url,
    body,
    error
  };
}
/** @internal */
function isFetchError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value._tag === "FetchError";
}
/** @internal */
function jsonStringify(value, schema) {
  return (0, _Function.pipe)(value, Schema.encode(schema), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))), Effect.map(_ => JSON.stringify(_)));
}
/** @internal */
function jsonParse(value, schema) {
  return (0, _Function.pipe)(Effect.sync(() => JSON.parse(value)), Effect.flatMap(Schema.decode(schema)), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))));
}
/** @internal */
function sendInternal(send) {
  return (url, data) => (0, _Function.pipe)(jsonStringify(data, send),
  // Effect.tap((body) => Effect.logDebug("Sending HTTP request to " + url + " with data " + body)),
  Effect.flatMap(body => Effect.tryPromise({
    try: signal => {
      return (0, _nodeFetch.default)(url, {
        signal,
        method: "POST",
        body
      });
    },
    catch: error => FetchError(url, body, String(error))
  }))
  // Effect.tap((response) => Effect.logDebug(url + " status: " + response.status))
  );
}
/** @internal */
function send(send, reply) {
  return (url, data) => (0, _Function.pipe)(sendInternal(send)(url, data), Effect.flatMap(response => Effect.promise(() => response.text())), Effect.flatMap(data => jsonParse(data, reply)), Effect.orDie, Effect.flatten);
}
/** @internal */
function sendStream(send, reply) {
  return (url, data) => (0, _Function.pipe)(sendInternal(send)(url, data), Effect.map(response => (0, _Function.pipe)(Stream.fromAsyncIterable(response.body, e => FetchError(url, "", String(e))), Stream.map(value => typeof value === "string" ? value : value.toString()), Stream.splitLines, Stream.filter(line => line.length > 0), Stream.map(line => line.startsWith("data:") ? line.substring("data:".length).trim() : line), Stream.mapEffect(data => jsonParse(data, reply)), Stream.mapEffect(_ => _))), Stream.fromEffect, Stream.flatten());
}
/** @internal */
function stringFromUint8ArrayString(encoding) {
  return stream => {
    const decoder = new TextDecoder(encoding);
    return Stream.mapChunks(stream, Chunk.map(bytes => decoder.decode(bytes)));
  };
}
/** @internal */
function uint8ArrayFromStringStream() {
  return stream => {
    const decoder = new TextEncoder();
    return Stream.mapChunks(stream, Chunk.map(strings => decoder.encode(strings)));
  };
}
//# sourceMappingURL=utils.js.map