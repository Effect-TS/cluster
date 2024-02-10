import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionState from "@effect/cluster-workflow/DurableExecutionState"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"

export function kill<A, IA, E, IE>(
  persistenceId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
) {
  return Effect.flatMap(
    DurableExecutionJournal.DurableExecutionJournal,
    (journal) =>
      DurableExecutionJournal.withState(journal, persistenceId, success, failure)(
        (state, persistEvent) => persistEvent(DurableExecutionEvent.DurableExecutionEventKillRequested)
      )
  )
}

export function attempt<A, IA, E, IE>(
  persistenceId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
) {
  return <R1, R2, R3>(
    attempt: (currentAttempt: number) => Effect.Effect<A, E, R1>,
    windDown: (currentAttempt: number) => Effect.Effect<void, never, R2>,
    beforeFiberInterrupt: Effect.Effect<void, never, R3>
  ): Effect.Effect<A, E, R1 | R2 | R3 | DurableExecutionJournal.DurableExecutionJournal> =>
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

      const executeAttempt = DurableExecutionJournal.withState(journal, persistenceId, success, failure)(
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

      return yield* _(executeAttempt, Effect.withSpan(persistenceId))
    })
}
