import * as ActivityContext from "@effect/cluster-workflow/ActivityContext"
import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as ActivityState from "@effect/cluster-workflow/DurableExecutionState"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as FiberRef from "effect/FiberRef"
import { pipe } from "effect/Function"

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

        return DurableExecutionJournal.withState(
          context.durableExecutionJournal,
          context.makePersistenceId(activityId),
          failure,
          success
        )(
          (state, persistEvent) => {
            const attemptEffectExecution = pipe(
              execute,
              Effect.catchAllDefect((defect) => Effect.die(String(defect))),
              Effect.provideService(ActivityContext.ActivityContext, {
                persistenceId,
                currentAttempt: state.currentAttempt
              })
            )

            const interruptCurrentFiber = pipe(
              WorkflowContext.setShouldInterruptCurrentFiberInActivity(false),
              Effect.zipRight(Effect.interrupt),
              Effect.onExit((exit) =>
                Exit.match(exit, {
                  onFailure: (cause) => FiberRef.set(FiberRef.interruptedCause, cause),
                  onSuccess: () => Effect.unit
                })
              )
            )

            const shouldInterruptCurrentFiber = Effect.checkInterruptible((isInterruptible) =>
              isInterruptible ? WorkflowContext.shouldInterruptCurrentFiberInActivity : Effect.succeed(false)
            )

            const beginInterruptionIfRequestedByWorkflow = pipe(
              persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionRequested),
              Effect.zipRight(persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionCompleted)),
              Effect.zipRight(interruptCurrentFiber),
              Effect.whenEffect(shouldInterruptCurrentFiber)
            )

            return pipe(
              ActivityState.match(state, {
                onPending: () =>
                  pipe(
                    persistEvent(DurableExecutionEvent.DurableExecutionEventAttempted),
                    Effect.zipRight(beginInterruptionIfRequestedByWorkflow),
                    Effect.zipRight(attemptEffectExecution),
                    Effect.onExit((exit) => persistEvent(DurableExecutionEvent.DurableExecutionEventCompleted(exit)))
                  ),
                onWindDown: () =>
                  pipe(
                    persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionCompleted),
                    Effect.zipRight(interruptCurrentFiber)
                  ),
                onFiberInterrupted: () => interruptCurrentFiber,
                onCompleted: ({ exit }) => exit
              }),
              Effect.unified
            )
          }
        )
      }
    )
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
