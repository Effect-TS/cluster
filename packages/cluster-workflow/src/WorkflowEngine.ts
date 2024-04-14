/**
 * @since 1.0.0
 */
import type * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import type * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowRuntime from "@effect/cluster-workflow/WorkflowRuntime"
import type * as Message from "@effect/cluster/Message"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Option from "effect/Option"
import * as PrimaryKey from "effect/PrimaryKey"
import type * as Scope from "effect/Scope"
import * as SynchronizedRef from "effect/SynchronizedRef"

/**
 * @since 1.0.0
 */
export interface WorkflowEngine<T extends Message.Message.Any> {
  sendDiscard: (request: T) => Effect.Effect<void>
  send: <A extends T>(request: A) => Effect.Effect<Message.Message.Success<A>, Message.Message.Error<A>>
}

/**
 * @since 1.0.0
 */
export function makeScoped<T extends Message.Message.Any, R>(
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
    ): Effect.Effect<Fiber.Fiber<Message.Message.Success<A>, Message.Message.Error<A>>> => {
      const executionId = PrimaryKey.value(request)

      return SynchronizedRef.modifyEffect(fibers, (state) =>
        pipe(
          HashMap.get(state, executionId),
          Option.match({
            onSome: (fiber) => Effect.succeed([fiber, state] as const),
            onNone: () =>
              pipe(
                WorkflowRuntime.attempt(workflow)(request),
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
    ): Effect.Effect<Message.Message.Success<A>, Message.Message.Error<A>> =>
      pipe(
        getOrStartFiber(request),
        Effect.flatMap((fiber) => Fiber.await(fiber)),
        Effect.flatten
      )

    return ({ send, sendDiscard })
  })
}
