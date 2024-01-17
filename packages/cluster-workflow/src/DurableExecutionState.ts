import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as Data from "effect/Data"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"

export class DurableExecutionStatePending
  extends Data.TaggedClass("@effect/cluster-workflow/DurableExecutionStatePending")<
    { lastSequence: number; currentAttempt: number; interruptedPreviously: boolean }
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

export type DurableExecutionState<E, A> = DurableExecutionStatePending | DurableExecutionStateCompleted<E, A>

export function initialState<E, A>(): DurableExecutionState<E, A> {
  return new DurableExecutionStatePending({ lastSequence: 0, currentAttempt: 0, interruptedPreviously: false })
}

export function match<E, A, B, C = B>(fa: DurableExecutionState<E, A>, fns: {
  onPending: (a: DurableExecutionStatePending) => B
  onCompleted: (a: DurableExecutionStateCompleted<E, A>) => C
}) {
  switch (fa._tag) {
    case "@effect/cluster-workflow/DurableExecutionStatePending":
      return fns.onPending(fa)
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
          currentAttempt: state.currentAttempt + 1,
          interruptedPreviously: false
        })
      ),
      onInterruptionRequested: () =>
        match(state, {
          onPending: ({ currentAttempt, lastSequence }) =>
            new DurableExecutionStatePending({ lastSequence, currentAttempt, interruptedPreviously: true }),
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
