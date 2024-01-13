import * as Activity from "@effect/cluster-workflow/Activity"
import * as ActivityError from "@effect/cluster-workflow/ActivityError"
import * as ActivityJournalInMemory from "@effect/cluster-workflow/ActivityJournalInMemory"
import * as CrashableRuntime from "@effect/cluster-workflow/CrashableRuntime"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Ref from "effect/Ref"
import { describe, expect, it } from "vitest"

describe.concurrent("Workflow", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(
      fa,
      Effect.provide(ActivityJournalInMemory.activityJournalInMemory),
      Logger.withMinimumLogLevel(LogLevel.Debug)
    )

  it("Should run as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const workflow = pipe(
        Effect.succeed(42),
        Activity.make("get-number", Schema.never, Schema.number)
      )

      const exit = yield* _(
        Workflow.attempt(workflow),
        Effect.exit
      )

      expect(exit).toEqual(Exit.succeed(42))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should fail as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const workflow = pipe(
        Effect.fail("error"),
        Activity.make("get-number", Schema.string, Schema.number)
      )

      const exit = yield* _(
        Workflow.attempt(workflow),
        Effect.exit
      )

      expect(exit).toEqual(Exit.fail("error"))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Die inside an activity gets converted into an ActivityError", () => {
    return Effect.gen(function*(_) {
      const workflow = pipe(
        Effect.die("defect"),
        Activity.make("get-number", Schema.string, Schema.number)
      )

      const exit = yield* _(
        Workflow.attempt(workflow),
        Effect.exit
      )

      expect(exit).toEqual(Exit.fail(new ActivityError.ActivityError({ error: "defect" })))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Activity should store in journal the result", () => {
    return Effect.gen(function*(_) {
      const workflow = pipe(
        Effect.sync(() => Math.random()),
        Activity.make("get-number", Schema.never, Schema.number)
      )

      const exit1 = yield* _(
        Workflow.attempt(workflow),
        Effect.exit
      )
      const exit2 = yield* _(
        Workflow.attempt(workflow),
        Effect.exit
      )

      expect(exit1).toEqual(exit2)
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
              Activity.make("get-number", Schema.never, Schema.number),
              Workflow.attempt
            )
          )
        )
      )

      const value = yield* _(Ref.get(valueRef))

      expect(value).toEqual(3)
    }).pipe(withTestEnv, Effect.runPromise)
  })
})
