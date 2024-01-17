import { Schema } from "@effect/schema"
import type * as Exit from "effect/Exit"

export interface DurableExecutionEventAttempted {
  _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted"
  sequence: number
}

export function DurableExecutionEventAttempted(sequence: number): DurableExecutionEvent<never, never> {
  return ({ _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted", sequence })
}

export interface DurableExecutionEventInterruptionRequested {
  _tag: "@effect/cluster-workflow/DurableExecutionEventInterruptionRequested"
  sequence: number
}

export function DurableExecutionEventInterruptionRequested(sequence: number): DurableExecutionEvent<never, never> {
  return ({ _tag: "@effect/cluster-workflow/DurableExecutionEventInterruptionRequested", sequence })
}

export interface DurableExecutionEventCompleted<E, A> {
  _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted"
  sequence: number
  exit: Exit.Exit<E, A>
}

export function ActivityCompleted<E, A>(exit: Exit.Exit<E, A>) {
  return (sequence: number): DurableExecutionEvent<E, A> => ({
    _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted",
    sequence,
    exit
  })
}

export type DurableExecutionEvent<E, A> =
  | DurableExecutionEventAttempted
  | DurableExecutionEventInterruptionRequested
  | DurableExecutionEventCompleted<E, A>

export type DurableExecutionEventFrom<IE, IA> = {
  readonly _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted"
  readonly sequence: number
} | {
  readonly _tag: "@effect/cluster-workflow/DurableExecutionEventInterruptionRequested"
  readonly sequence: number
} | {
  readonly _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted"
  readonly sequence: number
  readonly exit: Schema.ExitFrom<IE, IA>
}

export function schema<IE, E, IA, A>(failure: Schema.Schema<IE, E>, success: Schema.Schema<IA, A>): Schema.Schema<
  DurableExecutionEventFrom<IE, IA>,
  DurableExecutionEvent<E, A>
> {
  return Schema.union(
    Schema.struct({
      _tag: Schema.literal("@effect/cluster-workflow/DurableExecutionEventAttempted"),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal("@effect/cluster-workflow/DurableExecutionEventInterruptionRequested"),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal("@effect/cluster-workflow/DurableExecutionEventCompleted"),
      sequence: Schema.number,
      exit: Schema.exit(failure, success)
    })
  )
}

export function match<E, A, B, C = B, D = C>(
  fns: {
    onAttempted: (event: DurableExecutionEventAttempted) => B
    onInterruptionRequested: (event: DurableExecutionEventInterruptionRequested) => C
    onCompleted: (event: DurableExecutionEventCompleted<E, A>) => D
  }
) {
  return (event: DurableExecutionEvent<E, A>) => {
    switch (event._tag) {
      case "@effect/cluster-workflow/DurableExecutionEventAttempted":
        return fns.onAttempted(event)
      case "@effect/cluster-workflow/DurableExecutionEventInterruptionRequested":
        return fns.onInterruptionRequested(event)
      case "@effect/cluster-workflow/DurableExecutionEventCompleted":
        return fns.onCompleted(event)
    }
  }
}
