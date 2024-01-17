import * as Activity from "@effect/cluster-workflow/Activity"
import * as ActivityError from "@effect/cluster-workflow/ActivityError"
import * as CrashableRuntime from "@effect/cluster-workflow/CrashableRuntime"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as DurableExecutionJournalInMemory from "@effect/cluster-workflow/DurableExecutionJournalInMemory"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as Schema from "@effect/schema/Schema"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"
import { describe, expect, it, vi } from "vitest"

describe.concurrent("Workflow", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(
      fa,
      Effect.provide(DurableExecutionJournalInMemory.activityJournalInMemory),
      Logger.withMinimumLogLevel(LogLevel.Debug)
    )

  it("Should run as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const activity = pipe(
        Effect.succeed(42),
        Activity.attempt("activity", Schema.never, Schema.number)
      )

      const exit = yield* _(
        Workflow.attempt("wf", ActivityError.ActivityError, Schema.number)(activity),
        Effect.exit
      )

      expect(exit).toEqual(Exit.succeed(42))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should fail as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const activity = pipe(
        Effect.fail("error"),
        Activity.attempt("activity", Schema.string, Schema.number)
      )

      const exit = yield* _(
        Workflow.attempt("wf", Schema.union(Schema.string, ActivityError.ActivityError), Schema.number)(activity),
        Effect.exit
      )

      expect(exit).toEqual(Exit.fail("error"))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Die inside an activity gets converted into an ActivityError", () => {
    return Effect.gen(function*(_) {
      const activity = pipe(
        Effect.die("defect"),
        Activity.attempt("activity", Schema.never, Schema.number)
      )

      const exit = yield* _(
        Workflow.attempt("wf", ActivityError.ActivityError, Schema.number)(activity),
        Effect.exit
      )

      expect(exit).toEqual(Exit.fail(new ActivityError.ActivityError({ error: "defect" })))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Activity should store in journal the result", () => {
    return Effect.gen(function*(_) {
      const activity = pipe(
        Effect.sync(() => Math.random()),
        Activity.attempt("activity", Schema.never, Schema.number)
      )

      const exit1 = yield* _(
        Workflow.attempt("wf", ActivityError.ActivityError, Schema.number)(activity),
        Effect.exit
      )
      const exit2 = yield* _(
        Workflow.attempt("wf", ActivityError.ActivityError, Schema.number)(activity),
        Effect.exit
      )

      expect(exit1).toEqual(exit2)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it.only("Ensure that acquireUseRelease gets interrupted without calling release inside workflow", () => {
    return Effect.gen(function*(_) {
      const spyAcquire = vi.fn(() => 1)
      const spyUse = vi.fn(() => 2)
      const spyRelease = vi.fn(() => 3)
      const crashOnUse = yield* _(Ref.make(true))

      const workflow = CrashableRuntime.runWithCrash((crash) =>
        pipe(
          Effect.acquireUseRelease(
            pipe(
              Effect.sync(spyAcquire),
              Activity.attempt("acquire", Schema.never, Schema.number)
            ),
            () =>
              pipe(
                Effect.sync(spyUse),
                Effect.zipLeft(pipe(crash, Effect.whenEffect(Ref.get(crashOnUse)))),
                Activity.attempt("use", Schema.never, Schema.number)
              ),
            () =>
              pipe(
                Effect.sync(spyRelease),
                Activity.attempt("release", Schema.never, Schema.number),
                Effect.orDie
              )
          ),
          Workflow.attempt("wf", ActivityError.ActivityError, Schema.number)
        )
      )

      // first execution should crash
      yield* _(
        workflow,
        Effect.exit
      )

      expect(spyAcquire).toHaveBeenCalledOnce() // first time called
      expect(spyUse).toHaveBeenCalledOnce() // first attempt
      expect(spyRelease).not.toHaveBeenCalled() // never gets called

      // now the workflow gets executed again without crashing
      yield* _(Ref.set(crashOnUse, false))
      yield* _(
        workflow,
        Effect.exit
      )

      expect(spyAcquire).toHaveBeenCalledOnce() // not called
      expect(spyUse).toHaveBeenCalledTimes(2) // called again
      expect(spyRelease).toHaveBeenCalled() // first time called
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
              Activity.attempt("activity", Schema.never, Schema.number),
              Workflow.attempt("wf", ActivityError.ActivityError, Schema.number)
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
      const valueRef = yield* _(Ref.make(0))
      const latch = yield* _(Deferred.make<never, void>())

      const exit = yield* _(pipe(
        Ref.set(valueRef, 1),
        Effect.zipRight(Deferred.succeed(latch, undefined)),
        Effect.zipRight(Effect.never),
        Activity.attempt("activity", Schema.never, Schema.number),
        Workflow.attempt("wf", ActivityError.ActivityError, Schema.number),
        Effect.forkScoped,
        Effect.tap(Deferred.await(latch)),
        Effect.scoped,
        Effect.flatMap((_) => _.await)
      ))

      const value = yield* _(Ref.get(valueRef))
      const journalEntryCount = yield* _(
        DurableExecutionJournal.read("activity", Schema.never, Schema.number),
        Stream.runCount
      )

      expect(value).toEqual(1)
      expect(journalEntryCount).toEqual(1)
      expect(Exit.isInterrupted(exit)).toEqual(true)
    }).pipe(withTestEnv, Effect.runPromise)
  })
})
