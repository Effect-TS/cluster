import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import type { RuntimeFiber } from "effect/Fiber"
import * as FiberRef from "effect/FiberRef"
import { pipe } from "effect/Function"
import type * as Scheduler from "effect/Scheduler"

export class CrashableScheduler implements Scheduler.Scheduler {
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

export function onInterruptCrash<R, E, A>(fn: (crash: Effect.Effect<never, never, void>) => Effect.Effect<R, E, A>) {
  return pipe(
    FiberRef.get(FiberRef.currentScheduler),
    Effect.map((baseScheduler) => new CrashableScheduler(baseScheduler)),
    Effect.flatMap((scheduler) =>
      pipe(
        Deferred.make<E, A>(),
        Effect.flatMap((resultDeferred) => {
          const crash = pipe(
            Effect.sync(() => scheduler.crash()),
            Effect.zipRight(Deferred.interrupt(resultDeferred)),
            Effect.asUnit
          )

          return pipe(
            fn(crash),
            Effect.exit,
            Effect.flatMap((exit) => Deferred.complete(resultDeferred, exit)),
            Effect.forkDaemon,
            Effect.zipRight(Deferred.await(resultDeferred)),
            Effect.onInterrupt(() => crash)
          )
        })
      )
    )
  )
}
