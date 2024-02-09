import * as ActivityContext from "@effect/cluster-workflow/ActivityContext"
import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as DurableExecutionJournal from "./DurableExecutionJournal.js"

export function make<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
) {
  return <R>(execute: Effect.Effect<A, E, R>) => {
    return Effect.flatMap(
      WorkflowContext.WorkflowContext,
      (context) => {
        const persistenceId = context.makePersistenceId(activityId)

        const beginInterruptionIfRequestedByWorkflow = pipe(
          DurableExecution.kill(persistenceId, success, failure),
          Effect.zipRight(Effect.never),
          Effect.whenEffect(
            Effect.checkInterruptible((isInterruptible) =>
              isInterruptible ? WorkflowContext.shouldInterruptCurrentFiberInActivity : Effect.succeed(false)
            )
          ),
          Effect.provideService(DurableExecutionJournal.DurableExecutionJournal, context.durableExecutionJournal)
        )

        const earlyExitInGracefulShutdown = pipe(
          Effect.interrupt,
          Effect.whenEffect(context.isGracefulShutdownHappening)
        )

        return pipe(
          earlyExitInGracefulShutdown,
          Effect.zipRight(
            DurableExecution.attempt(persistenceId, success, failure)(
              (currentAttempt) =>
                pipe(
                  beginInterruptionIfRequestedByWorkflow,
                  Effect.zipRight(execute),
                  Effect.provideService(ActivityContext.ActivityContext, {
                    persistenceId,
                    currentAttempt
                  })
                ),
              () => Effect.unit,
              WorkflowContext.setShouldInterruptCurrentFiberInActivity(false)
            )
          ),
          Effect.provideService(DurableExecutionJournal.DurableExecutionJournal, context.durableExecutionJournal),
          Effect.annotateLogs("activityPersistenceId", persistenceId),
          Effect.annotateSpans("activityPersistenceId", persistenceId)
        )
      }
    )
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
