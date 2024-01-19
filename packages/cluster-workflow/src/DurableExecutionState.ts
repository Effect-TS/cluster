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

export class DurableExecutionStateWindDown
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStateWindDown")<
    { lastSequence: number; currentAttempt: number }
  >
{
}

export class DurableExecutionStateFiberInterrupted
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStateFiberInterrupted")<
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
  | DurableExecutionStateWindDown
  | DurableExecutionStateFiberInterrupted
  | DurableExecutionStateCompleted<E, A>

export function initialState<E, A>(): DurableExecutionState<E, A> {
  return new DurableExecutionStatePending({ lastSequence: 0, currentAttempt: 0 })
}

export function match<E, A, B, C = B, D = C, F = D>(fa: DurableExecutionState<E, A>, fns: {
  onPending: (a: DurableExecutionStatePending) => B
  onWindDown: (a: DurableExecutionStateWindDown) => C
  onFiberInterrupted: (a: DurableExecutionStateFiberInterrupted) => D
  onCompleted: (a: DurableExecutionStateCompleted<E, A>) => F
}) {
  switch (fa._tag) {
    case "@effect/cluster-workflow/DurableExecutionStatePending":
      return fns.onPending(fa)
    case "@effect/cluster-workflow/DurableExecutionStateWindDown":
      return fns.onWindDown(fa)
    case "@effect/cluster-workflow/DurableExecutionStateFiberInterrupted":
      return fns.onFiberInterrupted(fa)
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
        new DurableExecutionStatePending({
          lastSequence: sequence,
          currentAttempt: state.currentAttempt + 1
        })
      ),
      onInterruptionRequested: () =>
        match(state, {
          onPending: ({ currentAttempt, lastSequence }) =>
            new DurableExecutionStateWindDown({ lastSequence, currentAttempt }),
          onWindDown: (_) => _,
          onFiberInterrupted: (_) => _,
          onCompleted: (_) => _
        }),
      onInterruptionCompleted: () =>
        match(state, {
          onPending: (_) => _,
          onWindDown: ({ currentAttempt, lastSequence }) =>
            new DurableExecutionStateFiberInterrupted({ lastSequence, currentAttempt }),
          onFiberInterrupted: (_) => _,
          onCompleted: (_) => _
        }),
      onCompleted: ({ exit, sequence }) =>
        new DurableExecutionStateCompleted({
          lastSequence: sequence,
          currentAttempt: state.currentAttempt,
          exit
        })
    })
  )
}
