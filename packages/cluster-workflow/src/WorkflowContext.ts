/**
 * @since 1.0.0
 */
import type * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"

/**
 * @since 1.0.0
 */
export interface WorkflowContext {
  currentAttempt: number
  makePersistenceId: (localId: string) => string
  shouldInterruptCurrentFiberInActivity: Ref.Ref<boolean>
  isGracefulShutdownHappening: Effect.Effect<boolean>
  durableExecutionJournal: DurableExecutionJournal.DurableExecutionJournal
  yieldExecution: Effect.Effect<never>
}

/**
 * @since 1.0.0
 */
export const WorkflowContext = Context.GenericTag<WorkflowContext>("@services/WorkflowContext")

/**
 * @since 1.0.0
 */
export function make(args: WorkflowContext): WorkflowContext {
  return args
}

/**
 * @since 1.0.0
 */
export const shouldInterruptCurrentFiberInActivity = Effect.flatMap(
  WorkflowContext,
  (_) => Ref.get(_.shouldInterruptCurrentFiberInActivity)
)

/**
 * @since 1.0.0
 */
export const setShouldInterruptCurrentFiberInActivity = (value: boolean) =>
  Effect.flatMap(
    WorkflowContext,
    (_) => Ref.set(_.shouldInterruptCurrentFiberInActivity, value)
  )

/**
 * @since 1.0.0
 */
export function appendToPersistenceId(suffix: string) {
  return <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(
      fa,
      Effect.updateService(
        WorkflowContext,
        (context) => ({ ...context, makePersistenceId: (localId) => context.makePersistenceId(localId) + suffix })
      )
    )
}
