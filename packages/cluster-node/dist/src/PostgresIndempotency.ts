import type * as Message from "@effect/cluster/Message"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Option from "effect/Option"

export interface Itempotency<R, E, M> {
  (message: M): <R2, E2, A>(use: Effect.Effect<R2, E2, A>) => Effect.Effect<R | R2, E | E2, A>
}

export function make<R, E, M, T>(
  begin: (message: M) => Effect.Effect<R, E, T>,
  commit: (resource: T, message: M, reply: Option.Option<Message.Success<M>>) => Effect.Effect<R, never, void>,
  rollback: (resource: T, message: M) => Effect.Effect<R, never, void>
): Itempotency<R, E, M> {
  return (message) => (use) =>
    Effect.acquireUseRelease(
      begin(message),
      () => use,
      (resource, exit) => Exit.isFailure(exit) ? rollback(resource, message) : commit(resource, message, Option.none())
    )
}
