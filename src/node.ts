/**
 * @since 1.0.0
 */
import * as Either from "@effect/data/Either"
import { pipe } from "@effect/data/Function"
import * as Cause from "@effect/io/Cause"
import * as Effect from "@effect/io/Effect"
import type * as Schema from "@effect/schema/Schema"
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
    ) => (run: Effect.Effect<never, RE, RA>) => Effect.Effect<never, never, void>
  ) => Effect.Effect<never, never, void>
) {
  return <R, E, B>(fa: Effect.Effect<R, E, B>) =>
    Effect.acquireUseRelease(
      pipe(
        Effect.sync(() =>
          http.createServer((request, response) => {
            let body = ""
            request.on("data", (data) => (body += data))
            request.on("end", () => {
              return pipe(
                jsonParse(body, RequestSchema),
                Effect.flatMap((req) => {
                  const reply = <RE, RA>(schema: Schema.Schema<any, Either.Either<RE, RA>>) =>
                    (fa: Effect.Effect<never, RE, RA>) =>
                      pipe(
                        fa,
                        Effect.matchEffect(
                          (error) => jsonStringify(Either.left(error), schema),
                          (value) => jsonStringify(Either.right(value), schema)
                        ),
                        Effect.map((body) => [200, body] as const),
                        Effect.catchAllCause((cause) => Effect.sync(() => [500, JSON.stringify(cause)] as const)),
                        Effect.flatMap(([status, data]) =>
                          Effect.sync(() => {
                            response.writeHead(status, { "Content-Type": "application/json" })
                            response.end(data)
                          })
                        )
                      )
                  return handler(req, reply as any)
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
        Effect.tap(() => Effect.logDebug("Starting server on port " + port))
      ),
      () => fa,
      (http) => Effect.sync(() => http.close())
    )
}
