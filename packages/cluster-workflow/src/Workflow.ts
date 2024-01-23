import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionState from "@effect/cluster-workflow/DurableExecutionState"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import { ReadonlyArray } from "effect"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as FiberId from "effect/FiberId"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import type * as Request from "effect/Request"
import * as Scope from "effect/Scope"

export interface Workflow<R, T extends Schema.TaggedRequest.Any> {
  schema: Schema.Schema<unknown, T>
  executionId: (input: T) => string
  execute: (
    input: T
  ) => Effect.Effect<
    R | WorkflowContext.WorkflowContext,
    Request.Request.Error<T>,
    Request.Request.Success<T>
  >
}

export namespace Workflow {
  export type Any = Workflow<any, any>
  export type Context<A> = A extends Workflow<infer R, any> ? R : never
  export type Request<A> = A extends Workflow<any, infer T> ? T : never
}

export function effect<I, T extends Schema.TaggedRequest.Any, R>(
  schema: Schema.Schema<I, T>,
  executionId: (input: T) => string,
  execute: (
    input: T
  ) => Effect.Effect<R, Request.Request.Error<T>, Request.Request.Success<T>>
): Workflow<Exclude<R, WorkflowContext.WorkflowContext>, T> {
  return ({
    schema: schema as Schema.Schema<unknown, T>,
    executionId,
    execute: execute as any
  })
}

export function union<WFs extends ReadonlyArray<Workflow.Any>>(
  ...wfs: WFs
) {
  return effect<unknown, Workflow.Request<WFs[number]>, Workflow.Context<WFs[number]>>(
    Schema.union(...wfs.map((_) => _.schema)),
    (request) =>
      pipe(
        wfs,
        ReadonlyArray.findFirst((_) => Schema.is(_.schema)(request)),
        Option.map((_) => _.executionId(request)),
        Option.getOrElse(() => "")
      ),
    (request) =>
      pipe(
        wfs,
        ReadonlyArray.findFirst((_) => Schema.is(_.schema)(request)),
        Option.map((_) => _.execute(request) as any),
        Option.getOrElse(() => Effect.die("unknown workflow input"))
      )
  )
}

export function attempt<R, T extends Schema.TaggedRequest.Any>(
  workflow: Workflow<R, T>
) {
  return (request: T) =>
    unsafeAttempt(
      workflow.executionId(request),
      Serializable.failureSchema<unknown, Request.Request.Error<T>, unknown, unknown>(request as any),
      Serializable.successSchema<unknown, unknown, unknown, Request.Request.Success<T>>(request as any)
    )(workflow.execute(request))
}

export function unsafeAttempt<IE, E, IA, A>(
  workflowId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R, E, A>) => {
    return Effect.gen(function*(_) {
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

      return yield* _(
        DurableExecutionJournal.withState(durableExecutionJournal, workflowId, failure, success)(
          (state, persistEvent) => {
            const attemptExecution = pipe(
              execute,
              Effect.catchAllDefect((defect) => Effect.die(String(defect))),
              Effect.provideService(
                WorkflowContext.WorkflowContext,
                WorkflowContext.make({
                  workflowId,
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
