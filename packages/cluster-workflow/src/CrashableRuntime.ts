import * as Data from "effect/Data"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import type { RuntimeFiber } from "effect/Fiber"
import * as FiberRef from "effect/FiberRef"
import { pipe } from "effect/Function"
import type * as Scheduler from "effect/Scheduler"

export class CrashableRuntimeCrashedError
  extends Data.TaggedClass("@effect/cluster-workflow/CrashableRuntimeCrashedError")<{}>
{}

export function isCrashableRuntimeCrashedError(value: unknown): value is CrashableRuntimeCrashedError {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value._tag === "@effect/cluster-workflow/CrashableRuntimeCrashedError"
}

export class CrashableRuntimeScheduler implements Scheduler.Scheduler {
  crashed: boolean = false
  constructor(readonly baseScheduler: Scheduler.Scheduler) {}

  shouldYield(fiber: RuntimeFiber<unknown, unknown>): number | false {
    if (this.crashed) return 1
    return this.baseScheduler.shouldYield(fiber)
  }

  scheduleTask(task: Scheduler.Task, priority: number): void {
    if (this.crashed) return
    return this.baseScheduler.scheduleTask(task, priority)
  }

  crash() {
    this.crashed = true
  }
}

export interface CrashableRuntime {
  crash: Effect.Effect<never, never, void>
  run: <R, E, A>(
    fn: (restore: <R2, E2, A2>(fa: Effect.Effect<R2, E2, A2>) => Effect.Effect<R2, E2, A2>) => Effect.Effect<R, E, A>
  ) => Effect.Effect<R, E | CrashableRuntimeCrashedError, A>
}

export const make = pipe(
  FiberRef.get(FiberRef.currentScheduler),
  Effect.flatMap((baseScheduler) =>
    pipe(
      Deferred.make<CrashableRuntimeCrashedError, never>(),
      Effect.map((latch) => {
        const crashableScheduler = new CrashableRuntimeScheduler(baseScheduler)
        const restore = <R, E, A>(fa: Effect.Effect<R, E, A>) => pipe(fa, Effect.withScheduler(baseScheduler))

        const runtime: CrashableRuntime = {
          crash: restore(pipe(
            Effect.sync(() => crashableScheduler.crash()),
            Effect.zipRight(Deferred.fail(latch, new CrashableRuntimeCrashedError())),
            Effect.asUnit
          )),
          run: (fn) =>
            pipe(
              fn(restore),
              Effect.withScheduler(crashableScheduler),
              Effect.forkDaemon,
              Effect.flatMap((fiber) => Effect.raceFirst(Effect.disconnect(fiber.await), Deferred.await(latch))),
              Effect.flatten
            )
        }

        return runtime
      })
    )
  )
)

export function retryWhileCrashes<R, E, A>(
  fn: (runtime: CrashableRuntime) => Effect.Effect<R, E | CrashableRuntimeCrashedError, A>
): Effect.Effect<R, Exclude<E, CrashableRuntimeCrashedError>, A> {
  return pipe(
    make,
    Effect.flatMap(fn),
    Effect.retryWhile(isCrashableRuntimeCrashedError)
  ) as any
}

export function runWithCrash<R, E, A>(
  fn: (crash: Effect.Effect<never, never, void>) => Effect.Effect<R, E | CrashableRuntimeCrashedError, A>
): Effect.Effect<R, E | CrashableRuntimeCrashedError, A> {
  return pipe(
    make,
    Effect.flatMap((runtime) => runtime.run(() => fn(runtime.crash)))
  )
}
