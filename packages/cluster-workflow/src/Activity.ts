import * as ActivityContext from "@effect/cluster-workflow/ActivityContext"
import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as DurableExecutionJournal from "./DurableExecutionJournal.js"

export function make<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R, E, A>) => {
    return Effect.flatMap(
      WorkflowContext.WorkflowContext,
      (context) => {
        const persistenceId = context.makePersistenceId(activityId)

        const beginInterruptionIfRequestedByWorkflow = pipe(
          DurableExecution.kill(persistenceId, failure, success),
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
            DurableExecution.attempt(persistenceId, failure, success)(
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
          Effect.provideService(DurableExecutionJournal.DurableExecutionJournal, context.durableExecutionJournal)
        )
      }
    )
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
