"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asHttpServer = asHttpServer;
var Either = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Either"));
var Cause = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Cause"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var http = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("http"));
var _utils = /*#__PURE__*/require("./utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 * @internal
 */

/** @internal */
function asHttpServer(port, RequestSchema, handler) {
  return fa => Effect.acquireUseRelease(Effect.tap(() => Effect.log("Starting HTTP server on port " + port, "Info"))(Effect.tap(http => Effect.sync(() => http.listen(port)))(Effect.sync(() => http.createServer((request, response) => {
    const writeResponse = data => Effect.sync(() => response.write(data));
    const writeEventData = data => writeResponse("data: " + data + "\n\n");
    let body = "";
    request.on("data", data => body += data);
    request.on("end", () => {
      Effect.runCallback(Effect.catchAllCause(cause => Effect.sync(() => {
        response.writeHead(500);
        response.end(Cause.pretty(cause));
      }))(Effect.flatMap(req => {
        const reply = schema => fa => Effect.flatMap(data => Effect.sync(() => {
          response.writeHead(200, {
            "Content-Type": "application/json"
          });
          response.end(data);
        }))(Effect.matchEffect({
          onFailure: error => (0, _utils.jsonStringify)(Either.left(error), schema),
          onSuccess: value => (0, _utils.jsonStringify)(Either.right(value), schema)
        })(fa));
        const replyStream = schema => fa => Effect.flatMap(_ => Effect.sync(() => response.end()))(Effect.catchAll(error => Effect.flatMap(writeEventData)((0, _utils.jsonStringify)(Either.left(error), schema)))(Effect.flatMap(() => Stream.runDrain(Stream.mapEffect(value => Effect.flatMap(writeEventData)(Effect.orDie((0, _utils.jsonStringify)(Either.right(value), schema))))(fa)))(Effect.sync(() => response.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Connection": "keep-alive",
          "Cache-Control": "no-cache"
        })))));
        return handler(req, reply, replyStream);
      })((0, _utils.jsonParse)(body, RequestSchema))));
    });
  })))), () => fa, http => Effect.sync(() => http.close()));
}
//# sourceMappingURL=node.js.map