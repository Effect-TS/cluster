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

export class DurableExecutionStateCompleted<E, A>
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStateCompleted")<{
    lastSequence: number
    currentAttempt: number
    exit: Exit.Exit<E, A>
  }>
{
}

export type DurableExecutionState<E, A> =
  | DurableExecutionStatePending
  | DurableExecutionStateKilling
  | DurableExecutionStateKilled
  | DurableExecutionStateCompleted<E, A>

export function initialState<E, A>(): DurableExecutionState<E, A> {
  return new DurableExecutionStatePending({ lastSequence: 0, currentAttempt: 0 })
}

export function match<E, A, B, C = B, D = C, F = D>(fa: DurableExecutionState<E, A>, fns: {
  onPending: (a: DurableExecutionStatePending) => B
  onKilling: (a: DurableExecutionStateKilling) => C
  onKilled: (a: DurableExecutionStateKilled) => D
  onCompleted: (a: DurableExecutionStateCompleted<E, A>) => F
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

export function foldDurableExecutionEvent<E, A>(
  state: DurableExecutionState<E, A>,
  event: DurableExecutionEvent.DurableExecutionEvent<E, A>
): DurableExecutionState<E, A> {
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
