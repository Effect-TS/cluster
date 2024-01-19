import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
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

      return yield* _(
        DurableExecutionJournal.withState(workflowId, failure, success)(
          (state, persistEvent) => {
            const resumeWorkflowExecution = pipe(
              persistEvent(DurableExecutionEvent.DurableExecutionEventAttempted),
              Effect.zipRight(execute),
              Effect.catchAllDefect((defect) => Effect.die(String(defect))),
              Effect.provideService(
                WorkflowContext.WorkflowContext,
                WorkflowContext.make({
                  workflowId,
                  shouldInterruptOnFirstPendingActivity
                })
              ),
              Effect.exit,
              Effect.tap((exit) => persistEvent(DurableExecutionEvent.ActivityCompleted(exit))),
              Effect.flatten
            )

            return DurableExecutionState.match(state, {
              onPending: () => resumeWorkflowExecution,
              onWindDown: () =>
                pipe(
                  Ref.set(shouldInterruptOnFirstPendingActivity, true),
                  Effect.zipRight(resumeWorkflowExecution),
                  Effect.ensuring(persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionCompleted))
                ),
              onFiberInterrupted: () => Effect.interrupt,
              onCompleted: ({ exit }) => exit
            })
          }
        ),
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
