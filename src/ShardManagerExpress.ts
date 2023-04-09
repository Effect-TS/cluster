import * as Queue from "@effect/io/Queue";
import * as Deferred from "@effect/io/Deferred";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as http from "http";

export function asHttpServer(handler: (_: string) => Effect.Effect<never, never, string>) {
  return pipe(
    Queue.unbounded<[string, Deferred.Deferred<string, string>]>(),
    Effect.map((queue) => {
      const server = http.createServer((request, response) => {
        let body: string = "";
        request.on("data", (data) => (body += data));
        request.on("end", () =>
          pipe(
            Deferred.make<string, string>(),
            Effect.tap((p) => Queue.offer(queue, [body, p])),
            Effect.flatMap((p) => Deferred.await(p)),
            Effect.flatMap((result) =>
              Effect.sync(() => {
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(result);
              })
            ),
            Effect.runCallback
          )
        );
      });

      return [queue, server] as const;
    }),
    Effect.flatMap(([queue, http]) =>
      pipe(
        Effect.acquireUseRelease(
          Effect.sync(() => http.listen(1234)),
          () =>
            pipe(
              Queue.take(queue),
              Effect.flatMap(([req, p]) => pipe(Deferred.complete(p, handler(req)), Effect.fork)),
              Effect.forever
            ),
          (_) => Effect.sync(() => _.close())
        )
      )
    )
  );
}
