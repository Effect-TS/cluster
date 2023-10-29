import type * as Message from "@effect/cluster/Message";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
export interface Itempotency<R, E, M> {
    (message: M): <R2, E2, A>(use: Effect.Effect<R2, E2, A>) => Effect.Effect<R | R2, E | E2, A>;
}
export declare function make<R, E, M, T>(begin: (message: M) => Effect.Effect<R, E, T>, commit: (resource: T, message: M, reply: Option.Option<Message.Success<M>>) => Effect.Effect<R, never, void>, rollback: (resource: T, message: M) => Effect.Effect<R, never, void>): Itempotency<R, E, M>;
//# sourceMappingURL=PostgresIndempotency.d.ts.map