import * as Activity from "@effect/cluster-workflow/Activity"
import type * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import * as Schema from "@effect/schema/Schema"
import { ReadonlyArray } from "effect"
import * as Clock from "effect/Clock"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import type * as Request from "effect/Request"

export interface Workflow<T extends Schema.TaggedRequest.Any, R> {
  schema: Schema.Schema<T, unknown>
  executionId: (input: T) => string
  execute: (
    input: T
  ) => Effect.Effect<Request.Request.Success<T>, Request.Request.Error<T>, R | WorkflowContext.WorkflowContext>
}

export namespace Workflow {
  export type Any = Workflow<any, any>
  export type Context<A> = A extends Workflow<any, infer R> ? R : never
  export type Request<A> = A extends Workflow<infer T, any> ? T : never
}

export function make<T extends Schema.TaggedRequest.Any, R = never, I = unknown>(
  schema: Schema.Schema<T, I>,
  executionId: (input: T) => string,
  execute: (
    input: T
  ) => Effect.Effect<Request.Request.Success<T>, Request.Request.Error<T>, R>
): Workflow<T, Exclude<R, WorkflowContext.WorkflowContext>> {
  return ({
    schema: schema as Schema.Schema<T, unknown>,
    executionId,
    execute: execute as any
  })
}

export function union<WFs extends ReadonlyArray<Workflow.Any>>(
  ...wfs: WFs
) {
  return make<Workflow.Request<WFs[number]>, Workflow.Context<WFs[number]>>(
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

function remainingDuration(persistenceId: string, duration: Duration.Duration) {
  const startedAtActivity = Activity.make(persistenceId, Schema.number, Schema.never)(pipe(
    Clock.currentTimeMillis
  ))

  return pipe(
    startedAtActivity,
    Effect.flatMap(
      (startedAtMillis) =>
        pipe(
          Clock.currentTimeMillis,
          Effect.map((currentMillis) => Math.max(0, startedAtMillis + Duration.toMillis(duration) - currentMillis)),
          Effect.map(Duration.millis)
        )
    )
  )
}

export function sleep(persistenceId: string, duration: Duration.Duration) {
  return Effect.gen(function*(_) {
    const remaining = yield* _(remainingDuration(persistenceId, duration))
    yield* _(Effect.sleep(remaining))
  })
}

export function timeout(persistenceId: string, duration: Duration.Duration) {
  return <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    Effect.gen(function*(_) {
      const remaining = yield* _(remainingDuration(persistenceId, duration))
      yield* _(Effect.timeout(fa, remaining))
    })
}
