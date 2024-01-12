import * as CrashableRuntime from "@effect/cluster-workflow/CrashableRuntime"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Ref from "effect/Ref"

import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import { describe, expect, it } from "vitest"

describe.concurrent("Workflow", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) => pipe(fa, Logger.withMinimumLogLevel(LogLevel.Debug))

  it("Should run as expected if not crashed", () => {
    return Effect.gen(function*(_) {
      const runtime = yield* _(CrashableRuntime.make)

      const value = yield* _(
        runtime.run(() => Effect.succeed(42))
      )

      expect(value).toEqual(42)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should fail with CrashableRuntimeCrashed", () => {
    return Effect.gen(function*(_) {
      const runtime = yield* _(CrashableRuntime.make)
      const valueRef = yield* _(Ref.make<null | CrashableRuntime.CrashableRuntimeCrashed>(null))

      yield* _(
        runtime.run(() => runtime.crash),
        Effect.catchAll((error) => Ref.set(valueRef, error))
      )

      const value = yield* _(Ref.get(valueRef))

      expect(value).toEqual(new CrashableRuntime.CrashableRuntimeCrashed())
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Upon crash, release should not happen", () => {
    return Effect.gen(function*(_) {
      const runtime = yield* _(CrashableRuntime.make)
      const valueRef = yield* _(Ref.make(0))

      yield* _(
        runtime.run(() =>
          Effect.acquireUseRelease(
            Ref.set(valueRef, 1),
            () => pipe(Ref.set(valueRef, 2), Effect.zipRight(runtime.crash), Effect.zipRight(Ref.set(valueRef, 3))),
            () => Ref.set(valueRef, 4)
          )
        ),
        Effect.catchAll(() => Effect.unit)
      )

      const value = yield* _(Ref.get(valueRef))

      expect(value).toEqual(2)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Effects in restore should run as regular effects", () => {
    return Effect.gen(function*(_) {
      const runtime = yield* _(CrashableRuntime.make)
      const valueRef = yield* _(Ref.make(0))

      yield* _(
        runtime.run((restore) =>
          restore(pipe(
            runtime.crash,
            Effect.zipRight(Ref.set(valueRef, 42))
          ))
        ),
        Effect.catchAll(() => Effect.unit)
      )

      const value = yield* _(Ref.get(valueRef))

      expect(value).toEqual(42)
    }).pipe(withTestEnv, Effect.runPromise)
  })
})
