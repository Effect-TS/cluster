import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionState from "@effect/cluster-workflow/DurableExecutionState"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"

export function kill<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return Effect.flatMap(
    DurableExecutionJournal.DurableExecutionJournal,
    (journal) =>
      DurableExecutionJournal.withState(journal, persistenceId, failure, success)(
        (state, persistEvent) => persistEvent(DurableExecutionEvent.DurableExecutionEventKillRequested)
      )
  )
}

export function attempt<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R1, R2, R3>(
    attempt: (currentAttempt: number) => Effect.Effect<R1, E, A>,
    windDown: (currentAttempt: number) => Effect.Effect<R2, never, void>,
    beforeFiberInterrupt: Effect.Effect<R3, never, void>
  ): Effect.Effect<R1 | R2 | R3 | DurableExecutionJournal.DurableExecutionJournal, E, A> =>
    Effect.gen(function*(_) {
      const journal = yield* _(DurableExecutionJournal.DurableExecutionJournal)

      const killCurrentFiber = pipe(
        Fiber.getCurrentFiber(),
        Option.match({
          onNone: () => Effect.interrupt,
          onSome: (_) => pipe(beforeFiberInterrupt, Effect.zipRight(Fiber.interrupt(_)), Effect.forkDaemon)
        }),
        Effect.zipRight(Effect.never)
      )

      const executeAttempt = DurableExecutionJournal.withState(journal, persistenceId, failure, success)(
        (state, persistEvent) => {
          return pipe(
            DurableExecutionState.match(state, {
              onPending: () =>
                pipe(
                  persistEvent(DurableExecutionEvent.DurableExecutionEventAttempted),
                  Effect.zipRight(attempt(state.currentAttempt)),
                  Effect.catchAllDefect((defect) => Effect.die(String(defect))),
                  Effect.onExit((exit) => persistEvent(DurableExecutionEvent.DurableExecutionEventCompleted(exit)))
                ),
              onKilling: () =>
                pipe(
                  windDown(state.currentAttempt),
                  Effect.zipRight(persistEvent(DurableExecutionEvent.DurableExecutionEventKilled)),
                  Effect.zipRight(killCurrentFiber)
                ),
              onKilled: () => killCurrentFiber,
              onCompleted: ({ exit }) => exit
            }),
            Effect.unified
          )
        }
      )

      return yield* _(executeAttempt)
    })
}
