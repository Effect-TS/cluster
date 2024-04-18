/**
 * @since 1.0.0
 */
import * as Data from "effect/Data"
import type * as Deferred from "effect/Deferred"
import type * as Exit from "effect/Exit"

const REQUEST_FORK = "@effect/cluster-workflow/WorkflowRuntimeMessage/RequestFork"
/**
 * @since 1.0.0
 */
export class RequestFork extends Data.TaggedClass(REQUEST_FORK)<{
  persistenceId: string
  signal: Deferred.Deferred<void, never>
}> {}

const REQUEST_JOIN = "@effect/cluster-workflow/WorkflowRuntimeMessage/RequestJoin"
/**
 * @since 1.0.0
 */
export class RequestJoin extends Data.TaggedClass(REQUEST_JOIN)<{
  persistenceId: string
  signal: Deferred.Deferred<void, never>
}> {}

const REQUEST_YIELD = "@effect/cluster-workflow/WorkflowRuntimeMessage/RequestYield"
/**
 * @since 1.0.0
 */
export class RequestYield extends Data.TaggedClass(REQUEST_YIELD)<{}> {}

const REQUEST_COMPLETE = "@effect/cluster-workflow/WorkflowRuntimeMessage/RequestComplete"
/**
 * @since 1.0.0
 */
export class RequestComplete<A, E> extends Data.TaggedClass(REQUEST_COMPLETE)<{
  exit: Exit.Exit<A, E>
  signal: Deferred.Deferred<void, never>
}> {}

/**
 * @since 1.0.0
 */
export type WorkflowRuntimeMessage<A, E> = RequestJoin | RequestFork | RequestYield | RequestComplete<A, E>

/**
 * @since 1.0.0
 */
export function match<A, E, B, C = B, D = C, F = D>(fa: WorkflowRuntimeMessage<A, E>, fns: {
  onRequestFork: (message: RequestFork) => B
  onRequestJoin: (message: RequestJoin) => C
  onRequestYield: (message: RequestYield) => D
  onRequestComplete: (message: RequestComplete<A, E>) => F
}) {
  switch (fa._tag) {
    case REQUEST_FORK:
      return fns.onRequestFork(fa)
    case REQUEST_JOIN:
      return fns.onRequestJoin(fa)
    case REQUEST_YIELD:
      return fns.onRequestYield(fa)
    case REQUEST_COMPLETE:
      return fns.onRequestComplete(fa)
  }
}
