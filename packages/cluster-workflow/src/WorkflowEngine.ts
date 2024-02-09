import type * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import type * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowRunner from "@effect/cluster-workflow/WorkflowRunner"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import type * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Option from "effect/Option"
import type * as Request from "effect/Request"
import * as SynchronizedRef from "effect/SynchronizedRef"

export interface WorkflowEngine<T extends Schema.TaggedRequest.Any> {
  startDiscard: (request: T) => Effect.Effect<void>
  start: <A extends T>(request: A) => Effect.Effect<Request.Request.Success<A>, Request.Request.Error<A>>
}

export function makeScoped<T extends Schema.TaggedRequest.Any, R>(workflow: Workflow.Workflow<T, R>) {
  return Effect.gen(function*(_) {
    const executionScope = yield* _(Effect.scope)
    const fibers = yield* _(SynchronizedRef.make(HashMap.empty<string, Fiber.Fiber<any, any>>()))
    const env = yield* _(Effect.context<R | DurableExecutionJournal.DurableExecutionJournal>())

    const getOrStartFiber = <A extends T>(request: A): Effect.Effect<Fiber.Fiber<any, any>> => {
      const executionId = workflow.executionId(request)

      return SynchronizedRef.modifyEffect(fibers, (state) =>
        pipe(
          HashMap.get(state, executionId),
          Option.match({
            onSome: (fiber) => Effect.succeed([fiber, state] as const),
            onNone: () =>
              pipe(
                WorkflowRunner.resume(workflow)(request),
                Effect.provide(env),
                Effect.ensuring(SynchronizedRef.update(fibers, HashMap.remove(executionId))),
                Effect.forkIn(executionScope),
                Effect.map((fiber) => [fiber, HashMap.set(state, executionId, fiber)])
              )
          })
        ))
    }

    const startDiscard = (request: T) =>
      pipe(
        getOrStartFiber(request),
        Effect.asUnit
      )

    const start = <A extends T>(
      request: A
    ): Effect.Effect<Request.Request.Success<A>, Request.Request.Error<A>> =>
      pipe(
        getOrStartFiber(request),
        Effect.flatMap((fiber) => fiber.await),
        Effect.flatten
      )

    return ({ start, startDiscard })
  })
}
