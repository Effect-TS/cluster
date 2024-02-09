import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as Data from "effect/Data"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"

export class DurableExecutionStatePending
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStatePending")<
    { lastSequence: number; currentAttempt: number }
  >
{
}

export class DurableExecutionStateKilling
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStateKilling")<
    { lastSequence: number; currentAttempt: number }
  >
{
}

export class DurableExecutionStateKilled
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStateKilled")<
    { lastSequence: number; currentAttempt: number }
  >
{
}

export class DurableExecutionStateCompleted<A, E>
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStateCompleted")<{
    lastSequence: number
    currentAttempt: number
    exit: Exit.Exit<A, E>
  }>
{
}

export type DurableExecutionState<A, E> =
  | DurableExecutionStatePending
  | DurableExecutionStateKilling
  | DurableExecutionStateKilled
  | DurableExecutionStateCompleted<A, E>

export function initialState<A, E>(): DurableExecutionState<A, E> {
  return new DurableExecutionStatePending({ lastSequence: 0, currentAttempt: 0 })
}

export function match<A, E, B, C = B, D = C, F = D>(fa: DurableExecutionState<A, E>, fns: {
  onPending: (a: DurableExecutionStatePending) => B
  onKilling: (a: DurableExecutionStateKilling) => C
  onKilled: (a: DurableExecutionStateKilled) => D
  onCompleted: (a: DurableExecutionStateCompleted<A, E>) => F
}) {
  switch (fa._tag) {
    case "@effect/cluster-workflow/DurableExecutionStatePending":
      return fns.onPending(fa)
    case "@effect/cluster-workflow/DurableExecutionStateKilling":
      return fns.onKilling(fa)
    case "@effect/cluster-workflow/DurableExecutionStateKilled":
      return fns.onKilled(fa)
    case "@effect/cluster-workflow/DurableExecutionStateCompleted":
      return fns.onCompleted(fa)
  }
}

export function foldDurableExecutionEvent<A, E>(
  state: DurableExecutionState<A, E>,
  event: DurableExecutionEvent.DurableExecutionEvent<A, E>
): DurableExecutionState<A, E> {
  return pipe(
    event,
    DurableExecutionEvent.match({
      onAttempted: ({ sequence }) => (
        match(state, {
          onPending: ({ currentAttempt }) =>
            new DurableExecutionStatePending({
              lastSequence: sequence,
              currentAttempt: currentAttempt + 1
            }),
          onKilling: (_) => _,
          onKilled: (_) => _,
          onCompleted: (_) => _
        })
      ),
      onKillRequested: ({ sequence }) =>
        match(state, {
          onPending: ({ currentAttempt }) =>
            new DurableExecutionStateKilling({ lastSequence: sequence, currentAttempt }),
          onKilling: (_) => _,
          onKilled: (_) => _,
          onCompleted: (_) => _
        }),
      onKilled: ({ sequence }) =>
        match(state, {
          onPending: (_) => _,
          onKilling: ({ currentAttempt }) =>
            new DurableExecutionStateKilled({ lastSequence: sequence, currentAttempt }),
          onKilled: (_) => _,
          onCompleted: (_) => _
        }),
      onCompleted: ({ exit, sequence }) =>
        match(state, {
          onPending: ({ currentAttempt }) =>
            new DurableExecutionStateCompleted({
              lastSequence: sequence,
              currentAttempt,
              exit
            }),
          onKilling: (_) => _,
          onKilled: (_) => _,
          onCompleted: (_) => _
        })
    })
  )
}
