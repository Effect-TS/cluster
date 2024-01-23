import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionState from "@effect/cluster-workflow/DurableExecutionState"
import type * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as FiberId from "effect/FiberId"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"
import type * as Request from "effect/Request"
import * as Scope from "effect/Scope"

export function resume<R, T extends Schema.TaggedRequest.Any>(
  workflow: Workflow.Workflow<R, T>
) {
  return <A extends T>(request: A) => {
    return Effect.gen(function*(_) {
      const executionId = workflow.executionId(request)
      const shouldInterruptCurrentFiberInActivity = yield* _(Ref.make(false))
      const shouldAppendIntoJournal = yield* _(Ref.make(true))
      const executionScope = yield* _(Scope.make())

      const providedJournal = yield* _(DurableExecutionJournal.DurableExecutionJournal)
      const durableExecutionJournal: DurableExecutionJournal.DurableExecutionJournal = {
        read: providedJournal.read,
        append: (persistenceId, failure, success, event) =>
          pipe(
            providedJournal.append(persistenceId, failure, success, event),
            Effect.whenEffect(Ref.get(shouldAppendIntoJournal))
          )
      }

      const makePersistenceId = (localId: string) => executionId + "__" + localId

      const failureSchema = Serializable.failureSchema<unknown, Request.Request.Error<A>, unknown, unknown>(
        request as any
      )
      const successSchema = Serializable.successSchema<unknown, unknown, unknown, Request.Request.Success<A>>(
        request as any
      )

      return yield* _(
        DurableExecutionJournal.withState(
          durableExecutionJournal,
          executionId,
          failureSchema,
          successSchema
        )(
          (state, persistEvent) => {
            const attemptExecution = pipe(
              workflow.execute(request),
              Effect.catchAllDefect((defect) => Effect.die(String(defect))),
              Effect.provideService(
                WorkflowContext.WorkflowContext,
                WorkflowContext.make({
                  makePersistenceId,
                  shouldInterruptCurrentFiberInActivity,
                  durableExecutionJournal
                })
              )
            )

            const resumeWorkflowExecution = pipe(
              persistEvent(DurableExecutionEvent.DurableExecutionEventAttempted),
              Effect.zipRight(attemptExecution),
              Effect.onExit((exit) => persistEvent(DurableExecutionEvent.DurableExecutionEventCompleted(exit)))
            )

            return DurableExecutionState.match(state, {
              onPending: () => resumeWorkflowExecution,
              onWindDown: () =>
                pipe(
                  Ref.set(shouldInterruptCurrentFiberInActivity, true),
                  Effect.zipRight(resumeWorkflowExecution),
                  Effect.ensuring(persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionCompleted))
                ),
              onFiberInterrupted: () => Effect.interrupt,
              onCompleted: ({ exit }) => exit
            })
          }
        ),
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
