import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionState from "@effect/cluster-workflow/DurableExecutionState"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as FiberId from "effect/FiberId"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"
import * as Scope from "effect/Scope"

export function attempt<IE, E, IA, A>(
  workflowId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R, E, A>) => {
    return Effect.gen(function*(_) {
      const shouldInterruptOnFirstPendingActivity = yield* _(Ref.make(false))
      const shouldAppendIntoJournal = yield* _(Ref.make(true))
      const executionScope = yield* _(Scope.make())

      // if the execution is pending and interruption has been asked previously,
      // set a flag in the context such as the first pending interruptible activity will interrupt as it were from exit
      const attemptExecution = (state: DurableExecutionState.DurableExecutionState<E, A>) =>
        pipe(
          DurableExecutionState.match(state, {
            onPending: ({ interruptedPreviously }) =>
              Ref.set(shouldInterruptOnFirstPendingActivity, interruptedPreviously),
            onCompleted: () => Effect.unit
          }),
          Effect.unified,
          Effect.zipRight(
            execute
          ),
          Effect.provideService(
            WorkflowContext.WorkflowContext,
            WorkflowContext.make({
              workflowId,
              shouldInterruptOnFirstPendingActivity
            })
          )
        )

      return yield* _(
        DurableExecution.attempt(workflowId, failure, success)(attemptExecution),
        Effect.updateService(DurableExecutionJournal.DurableExecutionJournal, (journal) => ({
          read: journal.read,
          append: (persistenceId, failure, success, event) =>
            pipe(
              journal.append(persistenceId, failure, success, event),
              Effect.whenEffect(Ref.get(shouldAppendIntoJournal))
            )
        })),
        Effect.forkIn(executionScope),
        Effect.flatMap((fiber) => fiber.await),
        Effect.flatten,
        Effect.onInterrupt(() =>
          pipe(
            Ref.set(shouldAppendIntoJournal, false),
            Effect.zipRight(Scope.close(executionScope, Exit.interrupt(FiberId.none)))
          )
        )
      )
    })
  }
}
