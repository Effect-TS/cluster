/**
 * @since 1.0.0
 * @internal
 */
import * as Either from "@effect/data/Either";
import * as Cause from "@effect/io/Cause";
import * as Effect from "@effect/io/Effect";
import * as Stream from "@effect/stream/Stream";
import * as http from "http";
import { jsonParse, jsonStringify } from "./utils";
/** @internal */
export function asHttpServer(port, RequestSchema, handler) {
  return fa => Effect.acquireUseRelease(Effect.tap(() => Effect.logInfo("Starting HTTP server on port " + port))(Effect.tap(http => Effect.sync(() => http.listen(port)))(Effect.sync(() => http.createServer((request, response) => {
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
          onFailure: error => jsonStringify(Either.left(error), schema),
          onSuccess: value => jsonStringify(Either.right(value), schema)
        })(fa));
        const replyStream = schema => fa => Effect.flatMap(_ => Effect.sync(() => response.end()))(Effect.catchAll(error => Effect.flatMap(writeEventData)(jsonStringify(Either.left(error), schema)))(Effect.flatMap(() => Stream.runDrain(Stream.mapEffect(value => Effect.flatMap(writeEventData)(Effect.orDie(jsonStringify(Either.right(value), schema))))(fa)))(Effect.sync(() => response.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Connection": "keep-alive",
          "Cache-Control": "no-cache"
        })))));
        return handler(req, reply, replyStream);
      })(jsonParse(body, RequestSchema))));
    });
  })))), () => fa, http => Effect.sync(() => http.close()));
}
//# sourceMappingURL=node.mjs.map