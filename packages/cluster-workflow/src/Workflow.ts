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
import type * as Request from "effect/Request"
import * as Scope from "effect/Scope"

export interface Workflow<R, T extends Schema.TaggedRequest.Any> {
  schema: Schema.Schema<unknown, T>
  requestToId: (input: T) => string
  attempt: (input: T) => Effect.Effect<R, Request.Request.Error<T>, Request.Request.Success<T>>
}

export namespace Workflow {
  export type Any = Workflow<any, any>
  export type Context<A> = A extends Workflow<infer R, any> ? R : never
  export type Request<A> = A extends Workflow<any, infer T> ? T : never
}

export function make<I, T extends Schema.TaggedRequest.Any, R>(
  schema: Schema.Schema<I, T>,
  requestToId: (input: T) => string,
  attempt: (input: T) => Effect.Effect<R, Request.Request.Error<T>, Request.Request.Success<T>>
): Workflow<R, T> {
  return ({ schema: schema as Schema.Schema<unknown, T>, requestToId, attempt })
}

export function attempt<IE, E, IA, A>(
  workflowId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R, E, A>) => {
    return Effect.gen(function*(_) {
      const shouldInterruptCurrentFiberInActivity = yield* _(Ref.make(false))
      const shouldAppendIntoJournal = yield* _(Ref.make(true))
      const executionScope = yield* _(Scope.make())

      return yield* _(
        DurableExecutionJournal.withState(workflowId, failure, success)(
          (state, persistEvent) => {
            const attemptExecution = pipe(
              execute,
              Effect.catchAllDefect((defect) => Effect.die(String(defect))),
              Effect.provideService(
                WorkflowContext.WorkflowContext,
                WorkflowContext.make({
                  workflowId,
                  shouldInterruptCurrentFiberInActivity
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
