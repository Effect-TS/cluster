import type * as Workflow from "@effect/cluster-workflow/Workflow"
import type * as Schema from "@effect/schema/Schema"
import type * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as Request from "effect/Request"

export interface WorkflowEngine<R, T extends Schema.TaggedRequest.Any> {
  workflows: ReadonlyArray<Workflow.Workflow<R, T>>
}

export function make<WFs extends ReadonlyArray<Workflow.Workflow.Any>>(
  ...workflows: WFs
): WorkflowEngine<Workflow.Workflow.Context<WFs[number]>, Workflow.Workflow.Request<WFs[number]>> {
  return ({ workflows })
}
