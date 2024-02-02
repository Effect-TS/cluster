import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import type * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
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
      const isGracefulShutdownHappening = yield* _(Ref.make(false))
      const executionScope = yield* _(Scope.make())

      const providedJournal = yield* _(DurableExecutionJournal.DurableExecutionJournal)
      const durableExecutionJournal: DurableExecutionJournal.DurableExecutionJournal = {
        read: providedJournal.read,
        append: (persistenceId, failure, success, event) =>
          pipe(
            providedJournal.append(persistenceId, failure, success, event),
            Effect.unlessEffect(Ref.get(isGracefulShutdownHappening))
          )
      }

      const makePersistenceId = (localId: string) => executionId + "__" + localId

      const failureSchema = Serializable.failureSchema<unknown, Request.Request.Error<A>, unknown, unknown>(
        request as any
      )
      const successSchema = Serializable.successSchema<unknown, unknown, unknown, Request.Request.Success<A>>(
        request as any
      )

      const yieldExecution = pipe(
        Ref.set(isGracefulShutdownHappening, true),
        Effect.zipRight(Effect.fiberId),
        Effect.flatMap((_) => Scope.close(executionScope, Exit.interrupt(_)))
      )

      const resumeExecution = (currentAttempt: number) =>
        pipe(
          workflow.execute(request),
          Effect.provideService(
            WorkflowContext.WorkflowContext,
            WorkflowContext.make({
              makePersistenceId,
              shouldInterruptCurrentFiberInActivity,
              isGracefulShutdownHappening: Ref.get(isGracefulShutdownHappening),
              durableExecutionJournal,
              yieldExecution: pipe(yieldExecution, Effect.forkDaemon, Effect.zipRight(Effect.interrupt)),
              currentAttempt
            })
          )
        )

      return yield* _(
        DurableExecution.attempt(
          executionId,
          failureSchema,
          successSchema
        )(
          resumeExecution,
          (currentAttempt) =>
            pipe(
              Ref.set(shouldInterruptCurrentFiberInActivity, true),
              Effect.zipRight(resumeExecution(currentAttempt)),
              Effect.catchAllCause(() => Effect.unit)
            ),
          Effect.unit
        ),
        Effect.provideService(DurableExecutionJournal.DurableExecutionJournal, durableExecutionJournal),
        Effect.forkIn(executionScope),
        Effect.flatMap((fiber) => fiber.await),
        Effect.flatten,
        Effect.onInterrupt(() => yieldExecution)
      )
    })
  }
}
