import * as Activity from "@effect/cluster-workflow/Activity"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowEngine from "@effect/cluster-workflow/WorkflowEngine"
import * as Schema from "@effect/schema/Schema"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Ref from "effect/Ref"

import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import { describe, expect, it } from "vitest"

describe.concurrent("CrashableRuntime", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) => pipe(fa, Logger.withMinimumLogLevel(LogLevel.Info))

  it("Should run as expected if not crashed", () => {
    class SampleWorkflow extends Schema.TaggedRequest<SampleWorkflow>()("SampleWorkflow", Schema.never, Schema.number, {
      id: Schema.string
    }) {}

    const sampleActivity = pipe(
      Effect.succeed(42),
      Activity.attempt("activity", Schema.never, Schema.number)
    )

    const sampleWorkflow = Workflow.make(SampleWorkflow, (_) => _.id, () => sampleActivity)
  })
})
