/**
 * @since 1.0.0
 */
import * as Data from "effect/Data"
import type * as Exit from "effect/Exit"
import type * as WorkflowRuntimeMessage from "./WorkflowRuntimeMessage.js"

const REPLAY = "@effect/cluster-workflow/WorkflowRuntimeState/Replay"

/**
 * @since 1.0.0
 */
export class Replay<A, E> extends Data.TaggedClass(REPLAY)<{
  expectedSequence: number
  attempt: number
  delayedMessages: ReadonlyArray<WorkflowRuntimeMessage.WorkflowRuntimeMessage<A, E>>
}> {}

const RUNNING = "@effect/cluster-workflow/WorkflowRuntimeState/Running"

/**
 * @since 1.0.0
 */
export class Running extends Data.TaggedClass(RUNNING)<{
  attempt: number
  nextSequence: number
}> {}

const YIELDING = "@effect/cluster-workflow/WorkflowRuntimeState/Yielding"

/**
 * @since 1.0.0
 */
export class Yielding extends Data.TaggedClass(YIELDING)<{}> {}

const COMPLETED = "@effect/cluster-workflow/WorkflowRuntimeState/Completed"

/**
 * @since 1.0.0
 */
export class Completed<A, E> extends Data.TaggedClass(COMPLETED)<{
  exit: Exit.Exit<A, E>
}> {}

/**
 * @since 1.0.0
 */
export type WorkflowRuntimeState<A, E> = Replay<A, E> | Running | Yielding | Completed<A, E>

/**
 * @since 1.0.0
 */
export function match<A, E, B, C = B, D = C, F = D>(fa: WorkflowRuntimeState<A, E>, fns: {
  onReplay: (state: Replay<A, E>) => B
  onRunning: (state: Running) => C
  onYielding: (state: Yielding) => D
  onCompleted: (state: Completed<A, E>) => F
}) {
  switch (fa._tag) {
    case REPLAY:
      return fns.onReplay(fa)
    case RUNNING:
      return fns.onRunning(fa)
    case YIELDING:
      return fns.onYielding(fa)
    case COMPLETED:
      return fns.onCompleted(fa)
  }
}
