/**
 * @since 1.0.0
 * @internal
 */
import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as Cause from "@effect/io/Cause";
import * as Effect from "@effect/io/Effect";
import * as Stream from "@effect/stream/Stream";
import * as http from "http";
import { jsonParse, jsonStringify } from "./utils";
/** @internal */
export function asHttpServer(port, RequestSchema, handler) {
  return fa => Effect.acquireUseRelease(pipe(Effect.sync(() => http.createServer((request, response) => {
    const writeResponse = data => Effect.sync(() => response.write(data));
    const writeEventData = data => writeResponse("data: " + data + "\n\n");
    let body = "";
    request.on("data", data => body += data);
    request.on("end", () => {
      pipe(jsonParse(body, RequestSchema), Effect.flatMap(req => {
        const reply = schema => fa => pipe(fa, Effect.matchEffect({
          onFailure: error => jsonStringify(Either.left(error), schema),
          onSuccess: value => jsonStringify(Either.right(value), schema)
        }), Effect.flatMap(data => Effect.sync(() => {
          response.writeHead(200, {
            "Content-Type": "application/json"
          });
          response.end(data);
        })));
        const replyStream = schema => fa => pipe(Effect.sync(() => response.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Connection": "keep-alive",
          "Cache-Control": "no-cache"
        })), Effect.flatMap(() => pipe(fa, Stream.mapEffect(value => pipe(jsonStringify(Either.right(value), schema), Effect.orDie, Effect.flatMap(writeEventData))), Stream.runDrain)), Effect.catchAll(error => pipe(jsonStringify(Either.left(error), schema), Effect.flatMap(writeEventData))), Effect.flatMap(_ => Effect.sync(() => response.end())));
        return handler(req, reply, replyStream);
      }), Effect.catchAllCause(cause => Effect.sync(() => {
        response.writeHead(500);
        response.end(Cause.pretty(cause));
      })), Effect.runCallback);
    });
  })), Effect.tap(http => Effect.sync(() => http.listen(port))), Effect.tap(() => Effect.log("Starting HTTP server on port " + port, "Info"))), () => fa, http => Effect.sync(() => http.close()));
}
//# sourceMappingURL=node.mjs.map