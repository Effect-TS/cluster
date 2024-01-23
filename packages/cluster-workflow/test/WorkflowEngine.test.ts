import * as Activity from "@effect/cluster-workflow/Activity"
import * as DurableExecutionJournalInMemory from "@effect/cluster-workflow/DurableExecutionJournalInMemory"
import * as utils from "@effect/cluster-workflow/test/utils"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as Schema from "@effect/schema/Schema"
import * as Exit from "effect/Exit"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"

import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import { describe, expect, it } from "vitest"

describe.concurrent("WorkflowEngine", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(
      fa,
      Effect.provide(DurableExecutionJournalInMemory.activityJournalInMemory),
      Logger.withMinimumLogLevel(LogLevel.Debug)
    )

  it("Should run as expected if not crashed", () => {
    class SampleWorkflow extends Schema.TaggedRequest<SampleWorkflow>()("SampleWorkflow", Schema.never, Schema.number, {
      id: Schema.string
    }) {}

    const sampleActivity = pipe(
      Effect.succeed(42),
      Activity.make("activity", Schema.never, Schema.number)
    )

    const sampleWorkflow = Workflow.effect(SampleWorkflow, (_) => _.id, () => sampleActivity)

    return Effect.gen(function*(_) {
      const exit = yield* _(Workflow.attempt(sampleWorkflow)(new SampleWorkflow({ id: "wf" })), Effect.exit)
      expect(exit).toEqual(Exit.succeed(42))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should be able to compose different workflows", () => {
    const firstActivity = utils.mockActivity("activity1", Schema.never, Schema.number, () => Exit.succeed(1))
    const secondActivity = utils.mockActivity("activity2", Schema.never, Schema.number, () => Exit.succeed(2))

    class FirstWorkflow extends Schema.TaggedRequest<FirstWorkflow>()("FirstWorkflow", Schema.never, Schema.number, {
      id: Schema.string
    }) {}

    const firstWorkflow = Workflow.effect(FirstWorkflow, (_) => _.id, () => firstActivity.activity)

    class SecondWorkflow extends Schema.TaggedRequest<SecondWorkflow>()("SecondWorkflow", Schema.never, Schema.number, {
      id: Schema.string
    }) {}

    const secondWorkflow = Workflow.effect(SecondWorkflow, (_) => _.id, () => secondActivity.activity)

    const mergedWorkflow = Workflow.union(firstWorkflow, secondWorkflow)

    return Effect.gen(function*(_) {
      const exit = yield* _(Workflow.attempt(mergedWorkflow)(new FirstWorkflow({ id: "wf1" })), Effect.exit)

      expect(exit).toEqual(Exit.succeed(1))
      expect(firstActivity.spy).toHaveBeenCalledOnce()
      expect(secondActivity.spy).not.toHaveBeenCalled()

      const exit2 = yield* _(Workflow.attempt(mergedWorkflow)(new SecondWorkflow({ id: "wf2" })), Effect.exit)

      expect(exit2).toEqual(Exit.succeed(2))
      expect(firstActivity.spy).toHaveBeenCalledOnce()
      expect(secondActivity.spy).toHaveBeenCalledOnce()
    }).pipe(withTestEnv, Effect.runPromise)
  })
})
