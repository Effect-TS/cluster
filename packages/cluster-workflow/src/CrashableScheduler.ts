import type { RuntimeFiber } from "effect/Fiber"
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
}
