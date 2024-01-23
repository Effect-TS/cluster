import * as Activity from "@effect/cluster-workflow/Activity"
import * as CrashableRuntime from "@effect/cluster-workflow/CrashableRuntime"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionJournalInMemory from "@effect/cluster-workflow/DurableExecutionJournalInMemory"
import * as utils from "@effect/cluster-workflow/test/utils"
import * as Workflow from "@effect/cluster-workflow/Workflow"
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

  it("Should run as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const mocked = utils.mockEffect(() => Exit.succeed(42))

      const activity = pipe(
        mocked.effect,
        Activity.make("activity", Schema.never, Schema.number)
      )

      const exit = yield* _(
        Workflow.unsafeAttempt("wf", Schema.never, Schema.number)(activity),
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

      const exit = yield* _(
        Workflow.unsafeAttempt("wf", Schema.string, Schema.number)(activity),
        Effect.exit
      )

      expect(mocked.spy).toHaveBeenCalledOnce()
      expect(exit).toEqual(Exit.fail("error"))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Activity should store in journal the result", () => {
    return Effect.gen(function*(_) {
      const mocked = utils.mockEffect(() => Exit.succeed(Math.random()))

      const activity = pipe(mocked.effect, Activity.make("activity", Schema.never, Schema.number))

      const workflow = Workflow.unsafeAttempt("wf", Schema.never, Schema.number)(activity)

      const exit1 = yield* _(
        workflow,
        Effect.exit
      )
      const exit2 = yield* _(
        workflow,
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

      const workflow = (shouldCrash: boolean) =>
        CrashableRuntime.runWithCrash((crash) =>
          pipe(
            Effect.acquireUseRelease(
              mockedAcquire.activity,
              () => mockedUse.activityWithBody(shouldCrash ? crash : Effect.succeed(2)),
              () => mockedRelease.activity
            ),
            Workflow.unsafeAttempt("wf", Schema.never, Schema.number)
          )
        )

      // first execution should crash
      yield* _(
        workflow(true),
        Effect.exit
      )

      expect(mockedAcquire.spy).toHaveBeenCalledOnce()
      expect(mockedUse.spy).toHaveBeenCalledOnce()
      expect(mockedRelease.spy).not.toHaveBeenCalled()

      // now the workflow gets executed again without crashing
      yield* _(
        workflow(false),
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

      const workflow = (shouldCrash: boolean) =>
        CrashableRuntime.runWithCrash((crash) =>
          pipe(
            Effect.acquireUseRelease(
              mockedAcquire.activity,
              () => mockedUse.activity,
              () => mockedRelease.activityWithBody(shouldCrash ? crash : Effect.succeed(2))
            ),
            Workflow.unsafeAttempt("wf", Schema.never, Schema.number)
          )
        )

      // first execution should crash
      yield* _(
        workflow(true),
        Effect.exit
      )

      expect(mockedAcquire.spy).toHaveBeenCalledOnce()
      expect(mockedUse.spy).toHaveBeenCalledOnce()
      expect(mockedRelease.spy).toHaveBeenCalledOnce()

      // now the workflow gets executed again without crashing
      yield* _(
        workflow(false),
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
          runtime.run(() =>
            pipe(
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
              Activity.make("activity", Schema.never, Schema.number),
              Workflow.unsafeAttempt("wf", Schema.never, Schema.number)
            )
          )
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

      const exit = yield* _(
        Effect.acquireUseRelease(Effect.succeed(1), () =>
          pipe(
            mockedUse.effect,
            Effect.zipRight(Effect.never),
            Effect.zipLeft(Deferred.succeed(latch, undefined), { concurrent: true })
          ), () => mockedRelease.effect),
        mockedActivity.activityWithBody,
        Workflow.unsafeAttempt("wf", Schema.never, Schema.number),
        Effect.forkDaemon,
        Effect.tap(Deferred.await(latch)),
        Effect.tap((fiber) => Fiber.interrupt(fiber)),
        Effect.flatMap((_) => _.await)
      )

      const workflowJournalEntryCount = yield* _(
        DurableExecutionJournal.read("wf", Schema.never, Schema.number),
        Stream.runCount
      )

      const activityJournalEntryCount = yield* _(
        DurableExecutionJournal.read(Activity.persistenceId("wf", "activity"), Schema.never, Schema.number),
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
