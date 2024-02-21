import type * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"

export interface WorkflowContext {
  currentAttempt: number
  makePersistenceId: (localId: string) => string
  shouldInterruptCurrentFiberInActivity: Ref.Ref<boolean>
  isGracefulShutdownHappening: Effect.Effect<boolean>
  durableExecutionJournal: DurableExecutionJournal.DurableExecutionJournal
  yieldExecution: Effect.Effect<never>
}

export const WorkflowContext = Context.GenericTag<WorkflowContext>("@services/WorkflowContext")

export function make(args: WorkflowContext): WorkflowContext {
  return args
}

export const shouldInterruptCurrentFiberInActivity = Effect.flatMap(
  WorkflowContext,
  (_) => Ref.get(_.shouldInterruptCurrentFiberInActivity)
)

export const setShouldInterruptCurrentFiberInActivity = (value: boolean) =>
  Effect.flatMap(
    WorkflowContext,
    (_) => Ref.set(_.shouldInterruptCurrentFiberInActivity, value)
  )

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
