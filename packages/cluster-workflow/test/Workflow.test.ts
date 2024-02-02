import * as Activity from "@effect/cluster-workflow/Activity"
import * as ActivityContext from "@effect/cluster-workflow/ActivityContext"
import * as CrashableRuntime from "@effect/cluster-workflow/CrashableRuntime"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionJournalInMemory from "@effect/cluster-workflow/DurableExecutionJournalInMemory"
import * as utils from "@effect/cluster-workflow/test/utils"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowRunner from "@effect/cluster-workflow/WorkflowRunner"
import * as Schema from "@effect/schema/Schema"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"
import { describe, expect, it } from "vitest"

describe.concurrent("Workflow", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(
      fa,
      Effect.provide(DurableExecutionJournalInMemory.activityJournalInMemory),
      Logger.withMinimumLogLevel(LogLevel.Debug)
    )

  class StartWorkflowRequest
    extends Schema.TaggedRequest<StartWorkflowRequest>()("StartWorkflow", Schema.string, Schema.number, {
      executionId: Schema.string
    })
  {}

  it("Should run as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const mocked = utils.mockEffect(() => Exit.succeed(42))

      const activity = pipe(
        mocked.effect,
        Activity.make("activity", Schema.never, Schema.number)
      )

      const workflow = Workflow.make(StartWorkflowRequest, (_) => _.executionId, () => activity)

      const exit = yield* _(
        WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" })),
        Effect.exit
      )

      expect(mocked.spy).toHaveBeenCalledOnce()
      expect(exit).toEqual(Exit.succeed(42))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should fail as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const mocked = utils.mockEffect(() => Exit.fail("error"))

      const activity = pipe(
        mocked.effect,
        Activity.make("activity", Schema.string, Schema.number)
      )

      const workflow = Workflow.make(StartWorkflowRequest, (_) => _.executionId, () => activity)

      const exit = yield* _(
        WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" })),
        Effect.exit
      )

      expect(mocked.spy).toHaveBeenCalledOnce()
      expect(exit).toEqual(Exit.fail("error"))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should be able to compose different workflows", () => {
    const firstActivity = utils.mockActivity("activity1", Schema.never, Schema.number, () => Exit.succeed(1))
    const secondActivity = utils.mockActivity("activity2", Schema.never, Schema.number, () => Exit.succeed(2))

    class FirstWorkflow extends Schema.TaggedRequest<FirstWorkflow>()("FirstWorkflow", Schema.never, Schema.number, {
      id: Schema.string
    }) {}

    const firstWorkflow = Workflow.make(FirstWorkflow, (_) => _.id, () => firstActivity.activity)

    class SecondWorkflow extends Schema.TaggedRequest<SecondWorkflow>()("SecondWorkflow", Schema.never, Schema.number, {
      id: Schema.string
    }) {}

    const secondWorkflow = Workflow.make(SecondWorkflow, (_) => _.id, () => secondActivity.activity)

    const mergedWorkflow = Workflow.union(firstWorkflow, secondWorkflow)

    return Effect.gen(function*(_) {
      const exit = yield* _(WorkflowRunner.resume(mergedWorkflow)(new FirstWorkflow({ id: "wf1" })), Effect.exit)

      expect(exit).toEqual(Exit.succeed(1))
      expect(firstActivity.spy).toHaveBeenCalledOnce()
      expect(secondActivity.spy).not.toHaveBeenCalled()

      const exit2 = yield* _(WorkflowRunner.resume(mergedWorkflow)(new SecondWorkflow({ id: "wf2" })), Effect.exit)

      expect(exit2).toEqual(Exit.succeed(2))
      expect(firstActivity.spy).toHaveBeenCalledOnce()
      expect(secondActivity.spy).toHaveBeenCalledOnce()
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Activity should store in journal the result", () => {
    return Effect.gen(function*(_) {
      const mocked = utils.mockEffect(() => Exit.succeed(Math.random()))

      const activity = pipe(mocked.effect, Activity.make("activity", Schema.never, Schema.number))

      const workflow = Workflow.make(StartWorkflowRequest, (_) => _.executionId, () => activity)

      const exit1 = yield* _(
        WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" })),
        Effect.exit
      )
      const exit2 = yield* _(
        WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" })),
        Effect.exit
      )

      expect(mocked.spy).toHaveBeenCalledOnce()
      expect(exit1).toEqual(exit2)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Ensure that acquireUseRelease gets interrupted without calling release inside workflow", () => {
    return Effect.gen(function*(_) {
      const mockedAcquire = utils.mockActivity("acquire", Schema.never, Schema.number, () => Exit.succeed(1))
      const mockedUse = utils.mockActivity("use", Schema.never, Schema.number, () => Exit.succeed(2))
      const mockedRelease = utils.mockActivity("release", Schema.never, Schema.number, () => Exit.succeed(3))

      const executeAttempt = (shouldCrash: boolean) =>
        CrashableRuntime.runWithCrash((crash) => {
          const workflow = Workflow.make(StartWorkflowRequest, (_) => _.executionId, () =>
            Effect.acquireUseRelease(
              mockedAcquire.activity,
              () => mockedUse.activityWithBody(shouldCrash ? crash : Effect.succeed(2)),
              () => mockedRelease.activity
            ))

          return WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" }))
        })

      // first execution should crash
      yield* _(
        executeAttempt(true),
        Effect.exit
      )

      expect(mockedAcquire.spy).toHaveBeenCalledOnce()
      expect(mockedUse.spy).toHaveBeenCalledOnce()
      expect(mockedRelease.spy).not.toHaveBeenCalled()

      // now the workflow gets executed again without crashing
      yield* _(
        executeAttempt(false),
        Effect.exit
      )

      expect(mockedAcquire.spy).toHaveBeenCalledOnce()
      expect(mockedUse.spy).toHaveBeenCalledTimes(2)
      expect(mockedRelease.spy).toHaveBeenCalled()
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Upon crash on release, when restarted should resume release", () => {
    return Effect.gen(function*(_) {
      const mockedAcquire = utils.mockActivity("acquire", Schema.never, Schema.number, () => Exit.succeed(1))
      const mockedUse = utils.mockActivity("use", Schema.never, Schema.number, () => Exit.succeed(2))
      const mockedRelease = utils.mockActivity("release", Schema.never, Schema.number, () => Exit.succeed(3))

      const executeAttempt = (shouldCrash: boolean) =>
        CrashableRuntime.runWithCrash((crash) => {
          const workflow = Workflow.make(StartWorkflowRequest, (_) => _.executionId, () =>
            Effect.acquireUseRelease(
              mockedAcquire.activity,
              () => mockedUse.activity,
              () => mockedRelease.activityWithBody(shouldCrash ? crash : Effect.succeed(3))
            ))

          return WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" }))
        })

      // first execution should crash
      yield* _(
        executeAttempt(true),
        Effect.exit
      )

      expect(mockedAcquire.spy).toHaveBeenCalledOnce()
      expect(mockedUse.spy).toHaveBeenCalledOnce()
      expect(mockedRelease.spy).toHaveBeenCalledOnce()

      // now the workflow gets executed again without crashing
      yield* _(
        executeAttempt(false),
        Effect.exit
      )

      expect(mockedAcquire.spy).toHaveBeenCalledOnce()
      expect(mockedUse.spy).toHaveBeenCalledOnce()
      expect(mockedRelease.spy).toHaveBeenCalledTimes(2)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Current attempt should reflect actual execution attempt number", () => {
    return Effect.gen(function*(_) {
      const valueRef = yield* _(Ref.make(0))

      yield* _(
        CrashableRuntime.retryWhileCrashes((runtime) =>
          runtime.run(() => {
            const activity = pipe(
              Activity.currentAttempt,
              Effect.flatMap((attempt) =>
                pipe(
                  Ref.get(valueRef),
                  Effect.tap((_) => Effect.sync(() => expect(_).toEqual(attempt))),
                  Effect.flatMap(() =>
                    attempt < 3
                      ? pipe(
                        Ref.update(valueRef, (_) => _ + 1),
                        Effect.zipRight(runtime.crash),
                        Effect.zipRight(Effect.die("error"))
                      )
                      : Effect.succeed(42)
                  )
                )
              ),
              Activity.make("activity", Schema.never, Schema.number)
            )

            const workflow = Workflow.make(StartWorkflowRequest, (_) => _.executionId, () => activity)

            return WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" }))
          })
        )
      )

      const value = yield* _(Ref.get(valueRef))

      expect(value).toEqual(3)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("On graceful interrupt, should not persist exit into DurableExecutionJournal", () => {
    return Effect.gen(function*(_) {
      const mockedActivity = utils.mockActivity("activity", Schema.never, Schema.number, () => Exit.succeed(1))
      const mockedRelease = utils.mockEffect(() => Exit.succeed(1))
      const mockedUse = utils.mockEffect(() => Exit.succeed(1))
      const latch = yield* _(Deferred.make<never, void>())
      const persistenceIdRef = yield* _(Ref.make(""))

      const exit = yield* _(
        Effect.acquireUseRelease(Effect.succeed(1), () =>
          pipe(
            mockedUse.effect,
            Effect.zipRight(
              Effect.flatMap(ActivityContext.ActivityContext, (ctx) => Ref.set(persistenceIdRef, ctx.persistenceId))
            ),
            Effect.zipRight(Effect.never),
            Effect.zipLeft(Deferred.succeed(latch, undefined), { concurrent: true })
          ), () => mockedRelease.effect),
        mockedActivity.activityWithBody,
        (activity) => Workflow.make(StartWorkflowRequest, (_) => _.executionId, () => activity),
        (workflow) => WorkflowRunner.resume(workflow)(new StartWorkflowRequest({ executionId: "wf" })),
        Effect.forkDaemon,
        Effect.tap(Deferred.await(latch)),
        Effect.tap((fiber) => Fiber.interrupt(fiber)),
        Effect.flatMap((_) => _.await)
      )

      const workflowJournalEntryCount = yield* _(
        DurableExecutionJournal.read("wf", Schema.never, Schema.number, 0, false),
        Stream.runCount
      )

      const persistenceId = yield* _(Ref.get(persistenceIdRef))
      const activityJournalEntryCount = yield* _(
        DurableExecutionJournal.read(persistenceId, Schema.never, Schema.number, 0, false),
        Stream.runCount
      )

      expect(mockedUse.spy).toHaveBeenCalled()
      expect(mockedActivity.spy).toHaveBeenCalledOnce()
      expect(activityJournalEntryCount).toEqual(1)
      expect(workflowJournalEntryCount).toEqual(1)
      expect(Exit.isInterrupted(exit)).toEqual(true)
      expect(mockedRelease.spy).toHaveBeenCalledOnce()
    }).pipe(withTestEnv, Effect.runPromise)
  })
})
