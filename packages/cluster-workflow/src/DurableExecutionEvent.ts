/**
 * @since 1.0.0
 */
import { Schema } from "@effect/schema"
import type * as Exit from "effect/Exit"

/**
 * @since 1.0.0
 */
export interface DurableExecutionEventAttempted {
  _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted"
  sequence: number
}

/**
 * @since 1.0.0
 */
export function DurableExecutionEventAttempted(sequence: number): DurableExecutionEvent<never, never> {
  return ({ _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted", sequence })
}

/**
 * @since 1.0.0
 */
export interface DurableExecutionEventKillRequested {
  _tag: "@effect/cluster-workflow/DurableExecutionEventKillRequested"
  sequence: number
}

/**
 * @since 1.0.0
 */
export function DurableExecutionEventKillRequested(sequence: number): DurableExecutionEvent<never, never> {
  return ({ _tag: "@effect/cluster-workflow/DurableExecutionEventKillRequested", sequence })
}

/**
 * @since 1.0.0
 */
export interface DurableExecutionEventKilled {
  _tag: "@effect/cluster-workflow/DurableExecutionEventKilled"
  sequence: number
}

/**
 * @since 1.0.0
 */
export function DurableExecutionEventKilled(sequence: number): DurableExecutionEvent<never, never> {
  return ({ _tag: "@effect/cluster-workflow/DurableExecutionEventKilled", sequence })
}

/**
 * @since 1.0.0
 */
export interface DurableExecutionEventCompleted<A, E> {
  _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted"
  sequence: number
  exit: Exit.Exit<A, E>
}

/**
 * @since 1.0.0
 */
export function DurableExecutionEventCompleted<A, E>(exit: Exit.Exit<A, E>) {
  return (sequence: number): DurableExecutionEvent<A, E> => ({
    _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted",
    sequence,
    exit
  })
}

/**
 * @since 1.0.0
 */
export type DurableExecutionEvent<A, E> =
  | DurableExecutionEventAttempted
  | DurableExecutionEventKillRequested
  | DurableExecutionEventKilled
  | DurableExecutionEventCompleted<A, E>

/**
 * @since 1.0.0
 */
export type DurableExecutionEventEncoded<IE, IA> = {
  readonly _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted"
  readonly sequence: number
} | {
  readonly _tag: "@effect/cluster-workflow/DurableExecutionEventKillRequested"
  readonly sequence: number
} | {
  readonly _tag: "@effect/cluster-workflow/DurableExecutionEventKilled"
  readonly sequence: number
} | {
  readonly _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted"
  readonly sequence: number
  readonly exit: Schema.ExitEncoded<IE, IA>
}

/**
 * @since 1.0.0
 */
export function schema<A, IA, E, IE>(success: Schema.Schema<A, IA>, failure: Schema.Schema<E, IE>): Schema.Schema<
  DurableExecutionEvent<A, E>,
  DurableExecutionEventEncoded<IA, IE>
> {
  return Schema.union(
    Schema.struct({
      _tag: Schema.literal("@effect/cluster-workflow/DurableExecutionEventAttempted"),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal("@effect/cluster-workflow/DurableExecutionEventKillRequested"),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal("@effect/cluster-workflow/DurableExecutionEventKilled"),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal("@effect/cluster-workflow/DurableExecutionEventCompleted"),
      sequence: Schema.number,
      exit: Schema.exit<Schema.Schema<A, IA, never>, Schema.Schema<E, IE, never>, never>({ failure, success })
    })
  )
}

/**
 * @since 1.0.0
 */
export function match<A, E, B, C = B, D = C, F = D>(
  fns: {
    onAttempted: (event: DurableExecutionEventAttempted) => B
    onKillRequested: (event: DurableExecutionEventKillRequested) => C
    onKilled: (event: DurableExecutionEventKilled) => D
    onCompleted: (event: DurableExecutionEventCompleted<A, E>) => F
  }
) {
  return (event: DurableExecutionEvent<A, E>) => {
    switch (event._tag) {
      case "@effect/cluster-workflow/DurableExecutionEventAttempted":
        return fns.onAttempted(event)
      case "@effect/cluster-workflow/DurableExecutionEventKillRequested":
        return fns.onKillRequested(event)
      case "@effect/cluster-workflow/DurableExecutionEventKilled":
        return fns.onKilled(event)
      case "@effect/cluster-workflow/DurableExecutionEventCompleted":
        return fns.onCompleted(event)
    }
  }
}
