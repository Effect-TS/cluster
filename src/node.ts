import * as Queue from "@effect/io/Queue";
import * as Deferred from "@effect/io/Deferred";
import * as Effect from "@effect/io/Effect";
import * as Stream from "@effect/stream/Stream";
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";
import * as Layer from "@effect/io/Layer";
import * as http from "http";
import { jsonParse, jsonStringify } from "./utils";

// export function httpServer(
//   port: number,
//   handler: (
//     request: http.IncomingMessage,
//     body: Stream.Stream<never, never, string>
//   ) => Effect.Effect<
//     never,
//     never,
//     [status: number, headers: http.OutgoingHttpHeaders, body: Stream.Stream<never, never, string>]
//   >
// ) {
//   return <R, E, B>(fa: Effect.Effect<R, E, B>) =>
//     Effect.acquireUseRelease(
//       pipe(
//         Effect.sync(() =>
//           http.createServer((request, response) => {
//             let queue = Effect.runSync(Queue.unbounded<string>());
//             request.on("data", (data) => Effect.runSync(Queue.offer(queue, data)));
//             request.on("end", () =>
//               pipe(
//                 Queue.takeAll(queue),
//                 Effect.tap(() => Queue.shutdown(queue)),
//                 Effect.flatMap((chunks) => handler(request, Stream.fromChunk(chunks))),
//                 Effect.tap(([status, headers]) =>
//                   Effect.sync(() => response.writeHead(status, headers))
//                 ),
//                 Effect.tap(([_, __, body]) =>
//                   pipe(
//                     body,
//                     Stream.mapEffect((data) => Effect.sync(() => response.write(data))),
//                     Stream.runDrain
//                   )
//                 ),
//                 Effect.tap(() => Effect.sync(() => response.end())),
//                 Effect.runCallback
//               )
//             );
//           })
//         ),
//         Effect.tap((http) => Effect.sync(() => http.listen(port)))
//       ),
//       () => fa,
//       (http) => Effect.sync(() => http.close())
//     );
// }

export function asHttpServer<A2, A>(
  port: number,
  RequestSchema: Schema.Schema<A2, A>,
  handler: (
    req: A,
    reply: <B2, B>(schema: Schema.Schema<B2, B>, value: B) => Effect.Effect<never, never, void>
  ) => Effect.Effect<never, never, void>
) {
  return <R, E, B>(fa: Effect.Effect<R, E, B>) =>
    Effect.acquireUseRelease(
      pipe(
        Effect.sync(() =>
          http.createServer((request, response) => {
            let body: string = "";
            request.on("data", (data) => (body += data));
            request.on("end", () => {
              return pipe(
                jsonParse(body, RequestSchema),
                Effect.flatMap((req) => {
                  const reply = <B>(schema: Schema.Schema<B>, value: B) =>
                    pipe(
                      jsonStringify(value, schema),
                      Effect.map((body) => [200, body] as const),
                      Effect.catchAllCause((cause) =>
                        Effect.sync(() => [500, JSON.stringify(cause)] as const)
                      ),
                      Effect.flatMap(([status, data]) =>
                        Effect.sync(() => {
                          response.writeHead(status, { "Content-Type": "application/json" });
                          response.end(data);
                        })
                      )
                    );
                  return handler(req, reply as any);
                }),
                Effect.runCallback
              );
            });
          })
        ),
        Effect.tap((http) => Effect.sync(() => http.listen(port)))
      ),
      () => fa,
      (http) => Effect.sync(() => http.close())
    );
}
