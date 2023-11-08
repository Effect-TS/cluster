import * as PoisonPill from "@effect/cluster/PoisonPill"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import { assertTrue } from "@effect/cluster/test/util"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as FiberId from "effect/FiberId"
import { pipe } from "effect/Function"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Queue from "effect/Queue"
import * as Scope from "effect/Scope"

interface Sample {
  _tag: "sample"
}

describe.concurrent("RecipientBehaviour", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(fa, Effect.scoped, Logger.withMinimumLogLevel(LogLevel.Debug))

  const makeTestActor = <R, A>(fa: RecipientBehaviour.RecipientBehaviour<R, A>, scope: Scope.Scope) =>
    pipe(
      fa("test"),
      Effect.provideService(RecipientBehaviour.RecipientBehaviourContext, {
        entityId: "entity1",
        reply: (_, __) => Effect.unit
      }),
      Scope.extend(scope)
    )

  it("Handles a whole queue of messages", () => {
    return Effect.gen(function*(_) {
      const received = yield* _(Deferred.make<never, boolean>())

      const behaviour = RecipientBehaviour.fromInMemoryQueue<never, Sample | PoisonPill.PoisonPill>(
        (entityId, dequeue) =>
          pipe(
            Queue.take(dequeue),
            Effect.flatMap(() => Deferred.succeed(received, true))
          )
      )

      const scope = yield* _(Scope.make())
      const offer = yield* _(makeTestActor(behaviour, scope))
      yield* _(offer({ _tag: "sample" }))
      yield* _(Scope.close(scope, Exit.interrupt(FiberId.none)))

      assertTrue(yield* _(Deferred.await(received)))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Ensure cleanup is run upon closing the scope", () => {
    let interrupted = false
    return Effect.gen(function*(_) {
      const started = yield* _(Deferred.make<never, boolean>())

      const behaviour = RecipientBehaviour.fromInMemoryQueue<never, Sample | PoisonPill.PoisonPill>(
        (entityId, dequeue) =>
          pipe(
            Queue.take(dequeue),
            Effect.flatMap((msg) => {
              if (PoisonPill.isPoisonPill(msg)) {
                interrupted = true
                return Effect.interrupt
              }
              return Deferred.succeed(started, true)
            }),
            Effect.forever
          )
      )

      const scope = yield* _(Scope.make())
      const offer = yield* _(makeTestActor(behaviour, scope))
      yield* _(offer({ _tag: "sample" }))
      yield* _(Deferred.await(started))
      yield* _(Scope.close(scope, Exit.interrupt(FiberId.none)))
    }).pipe(withTestEnv, Effect.runPromise).then(() => assertTrue(interrupted))
  })
})
