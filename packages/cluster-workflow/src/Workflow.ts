import type * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import * as Schema from "@effect/schema/Schema"
import { ReadonlyArray } from "effect"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import type * as Request from "effect/Request"

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

export function make<I, T extends Schema.TaggedRequest.Any, R>(
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
  return make<unknown, Workflow.Request<WFs[number]>, Workflow.Context<WFs[number]>>(
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
