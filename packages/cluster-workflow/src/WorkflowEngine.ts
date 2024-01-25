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
  startDiscard: (request: T) => Effect.Effect<never, never, void>
  start: <A extends T>(request: A) => Effect.Effect<never, Request.Request.Error<A>, Request.Request.Success<A>>
}

export function makeScoped<R, T extends Schema.TaggedRequest.Any>(workflow: Workflow.Workflow<R, T>) {
  return Effect.gen(function*(_) {
    const executionScope = yield* _(Effect.scope)
    const fibers = yield* _(SynchronizedRef.make(HashMap.empty<string, Fiber.Fiber<any, any>>()))
    const env = yield* _(Effect.context<R | DurableExecutionJournal.DurableExecutionJournal>())

    const getOrStartFiber = <A extends T>(request: A): Effect.Effect<never, never, Fiber.Fiber<any, any>> =>
      SynchronizedRef.modifyEffect(fibers, (state) =>
        pipe(
          HashMap.get(state, workflow.executionId(request)),
          Option.match({
            onSome: (fiber) => Effect.succeed([fiber, state] as const),
            onNone: () =>
              pipe(
                WorkflowRunner.resume(workflow)(request),
                Effect.provide(env),
                Effect.ensuring(SynchronizedRef.update(fibers, HashMap.remove(workflow.executionId(request)))),
                Effect.forkIn(executionScope),
                Effect.map((fiber) => [fiber, HashMap.set(state, workflow.executionId(request), fiber)])
              )
          })
        ))

    const startDiscard = (request: T) =>
      pipe(
        getOrStartFiber(request),
        Effect.asUnit
      )

    const start = <A extends T>(
      request: A
    ): Effect.Effect<never, Request.Request.Error<A>, Request.Request.Success<A>> =>
      pipe(
        getOrStartFiber(request),
        Effect.flatMap((fiber) => fiber.await),
        Effect.flatten
      )

    return ({ start, startDiscard })
  })
}
