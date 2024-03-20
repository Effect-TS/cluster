import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import type * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import type * as Request from "effect/Request"
import * as Scope from "effect/Scope"
import * as SynchronizedRef from "effect/SynchronizedRef"

export interface WorkflowEngine<T extends Schema.TaggedRequest.Any> {
  sendDiscard: (request: T) => Effect.Effect<void>
  send: <A extends T>(request: A) => Effect.Effect<Request.Request.Success<A>, Request.Request.Error<A>>
}

function resume<T extends Schema.TaggedRequest.Any, R>(
  workflow: Workflow.Workflow<T, R>
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
        append: (persistenceId, success, failure, event) =>
          pipe(
            providedJournal.append(persistenceId, success, failure, event),
            Effect.unlessEffect(Ref.get(isGracefulShutdownHappening))
          )
      }

      const makePersistenceId = (localId: string) => executionId + "__" + localId

      const failureSchema = Serializable.failureSchema<unknown, unknown, Request.Request.Error<A>, unknown, never>(
        request as any
      )
      const successSchema = Serializable.successSchema<Request.Request.Success<A>, unknown, unknown, unknown, never>(
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
              yieldExecution: pipe(yieldExecution, Effect.forkDaemon, Effect.zipRight(Effect.never)),
              currentAttempt
            })
          )
        )

      return yield* _(
        DurableExecution.attempt(
          executionId,
          successSchema,
          failureSchema
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
        Effect.onInterrupt(() => yieldExecution),
        Effect.annotateLogs("workflowPersistenceId", executionId),
        Effect.annotateSpans("workflowPersistenceId", executionId)
      )
    })
  }
}

export function makeScoped<T extends Schema.TaggedRequest.Any, R>(
  workflow: Workflow.Workflow<T, R>
): Effect.Effect<
  WorkflowEngine<T>,
  never,
  R | Scope.Scope | DurableExecutionJournal.DurableExecutionJournal
> {
  return Effect.gen(function*(_) {
    const executionScope = yield* _(Effect.scope)
    const fibers = yield* _(
      SynchronizedRef.make(HashMap.empty<string, Fiber.Fiber<any, any>>())
    )
    const env = yield* _(Effect.context<R | DurableExecutionJournal.DurableExecutionJournal>())

    const getOrStartFiber = <A extends T>(
      request: A
    ): Effect.Effect<Fiber.Fiber<Request.Request.Success<A>, Request.Request.Error<A>>> => {
      const executionId = workflow.executionId(request)

      return SynchronizedRef.modifyEffect(fibers, (state) =>
        pipe(
          HashMap.get(state, executionId),
          Option.match({
            onSome: (fiber) => Effect.succeed([fiber, state] as const),
            onNone: () =>
              pipe(
                resume(workflow)(request),
                Effect.provide(env),
                Effect.ensuring(SynchronizedRef.update(fibers, HashMap.remove(executionId))),
                Effect.forkIn(executionScope),
                Effect.map((fiber) => [fiber, HashMap.set(state, executionId, fiber)])
              )
          })
        ))
    }

    const sendDiscard = (request: T) =>
      pipe(
        getOrStartFiber(request),
        Effect.asUnit
      )

    const send = <A extends T>(
      request: A
    ): Effect.Effect<Request.Request.Success<A>, Request.Request.Error<A>> =>
      pipe(
        getOrStartFiber(request),
        Effect.flatMap((fiber) => Fiber.await(fiber)),
        Effect.flatten
      )

    return ({ send, sendDiscard })
  })
}
