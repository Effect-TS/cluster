/**
 * @since 1.0.0
 * @internal
 */

import * as Either from "@effect/data/Either"
import { pipe } from "@effect/data/Function"
import * as Cause from "@effect/io/Cause"
import * as Effect from "@effect/io/Effect"
import type * as Schema from "@effect/schema/Schema"
import * as Stream from "@effect/stream/Stream"
import * as http from "http"
import { jsonParse, jsonStringify } from "./utils"

/** @internal */
export function asHttpServer<A2, A>(
  port: number,
  RequestSchema: Schema.Schema<A2, A>,
  handler: (
    req: A,
    reply: <RE, RA>(
      schema: Schema.Schema<any, Either.Either<RE, RA>>
    ) => (run: Effect.Effect<never, RE, RA>) => Effect.Effect<never, never, void>,
    replyStream: <RE, RA>(
      schema: Schema.Schema<any, Either.Either<RE, RA>>
    ) => (run: Stream.Stream<never, RE, RA>) => Effect.Effect<never, never, void>
  ) => Effect.Effect<never, never, void>
) {
  return <R, E, B>(fa: Effect.Effect<R, E, B>) =>
    Effect.acquireUseRelease(
      pipe(
        Effect.sync(() =>
          http.createServer((request, response) => {
            const writeResponse = (data: string) => Effect.sync(() => response.write(data))
            const writeEventData = (data: string) => writeResponse("data: " + data + "\n\n")
            let body = ""
            request.on("data", (data) => (body += data))
            request.on("end", () => {
              pipe(
                jsonParse(body, RequestSchema),
                Effect.flatMap((req) => {
                  const reply = <RE, RA>(schema: Schema.Schema<any, Either.Either<RE, RA>>) =>
                    (fa: Effect.Effect<never, RE, RA>) =>
                      pipe(
                        fa,
                        Effect.matchEffect({
                          onFailure: (error) => jsonStringify(Either.left(error), schema),
                          onSuccess: (value) => jsonStringify(Either.right(value), schema)
                        }),
                        Effect.flatMap((data) =>
                          Effect.sync(() => {
                            response.writeHead(200, { "Content-Type": "application/json" })
                            response.end(data)
                          })
                        )
                      )
                  const replyStream = <RE, RA>(schema: Schema.Schema<any, Either.Either<RE, RA>>) =>
                    (fa: Stream.Stream<never, RE, RA>) =>
                      pipe(
                        Effect.sync(() =>
                          response.writeHead(200, {
                            "Content-Type": "text/event-stream",
                            "Connection": "keep-alive",
                            "Cache-Control": "no-cache"
                          })
                        ),
                        Effect.flatMap(() =>
                          pipe(
                            fa,
                            Stream.mapEffect((value) =>
                              pipe(
                                jsonStringify(Either.right(value), schema),
                                Effect.orDie,
                                Effect.flatMap(writeEventData)
                              )
                            ),
                            Stream.runDrain
                          )
                        ),
                        Effect.catchAll((error) =>
                          pipe(
                            jsonStringify(Either.left(error), schema),
                            Effect.flatMap(writeEventData)
                          )
                        ),
                        Effect.flatMap((_) => Effect.sync(() => response.end()))
                      )

                  return handler(req, reply as any, replyStream as any)
                }),
                Effect.catchAllCause((cause) =>
                  Effect.sync(() => {
                    response.writeHead(500)
                    response.end(Cause.pretty(cause))
                  })
                ),
                Effect.runCallback
              )
            })
          })
        ),
        Effect.tap((http) => Effect.sync(() => http.listen(port))),
        Effect.tap(() => Effect.log("Starting HTTP server on port " + port, { level: "Info" }))
      ),
      () => fa,
      (http) => Effect.sync(() => http.close())
    )
}
