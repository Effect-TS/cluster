/**
 * @since 1.0.0
 */
import { Schema } from "@effect/schema"
import type * as Exit from "effect/Exit"

const ATTEMPTED = "@effect/cluster-workflow/DurableExecutionEvent/Attempted"

/**
 * @since 1.0.0
 */
export interface Attempted {
  _tag: typeof ATTEMPTED
  sequence: number
  version: number
}

/**
 * @since 1.0.0
 */
export function Attempted(version: number) {
  return (sequence: number): DurableExecutionEvent<never, never> => ({ _tag: ATTEMPTED, sequence, version })
}

const COMPLETED = "@effect/cluster-workflow/DurableExecutionEvent/Completed"

/**
 * @since 1.0.0
 */
export interface Completed<A, E> {
  _tag: typeof COMPLETED
  sequence: number
  exit: Exit.Exit<A, E>
}

/**
 * @since 1.0.0
 */
export function Completed<A, E>(exit: Exit.Exit<A, E>) {
  return (sequence: number): DurableExecutionEvent<A, E> => ({
    _tag: COMPLETED,
    sequence,
    exit
  })
}

const INTERRUPTION_REQUESTED = "@effect/cluster-workflow/DurableExecutionEvent/InterruptionRequested"

/**
 * @since 1.0.0
 */
export interface InterruptionRequested {
  _tag: typeof INTERRUPTION_REQUESTED
  sequence: number
}

/**
 * @since 1.0.0
 */
export function KillRequested(sequence: number): DurableExecutionEvent<never, never> {
  return ({ _tag: INTERRUPTION_REQUESTED, sequence })
}


const FORKED = "@effect/cluster-workflow/DurableExecutionEvent/Forked"
/**
 * @since 1.0.0
 */
export interface Forked {
  _tag: typeof FORKED
  sequence: number
  persistenceId: string
}

/**
 * @since 1.0.0
 */
export function Forked(persistenceId: string) {
  return (sequence: number): DurableExecutionEvent<never, never> => ({ _tag: FORKED, sequence, persistenceId })
}

const JOINED = "@effect/cluster-workflow/DurableExecutionEvent/Joined"

/**
 * @since 1.0.0
 */
export interface Joined {
  _tag: typeof JOINED
  sequence: number
  persistenceId: string
}

/**
 * @since 1.0.0
 */
export function Joined(persistenceId: string) {
  return (sequence: number): DurableExecutionEvent<never, never> => ({ _tag: JOINED, sequence, persistenceId })
}

/**
 * @since 1.0.0
 */
export type DurableExecutionEvent<A, E> =
  | Attempted
  | InterruptionRequested
  | Completed<A, E>
  | Forked
  | Joined

/**
* @since 1.0.0
*/
export type DurableExecutionEventFrom<IE, IA> = {
  readonly _tag: typeof ATTEMPTED
  readonly sequence: number
  readonly version: number
} | {
  readonly _tag: typeof INTERRUPTION_REQUESTED
  readonly sequence: number
} | {
  readonly _tag: typeof COMPLETED
  readonly sequence: number
  readonly exit: Schema.ExitEncoded<IE, IA>
} | {
  readonly _tag: typeof FORKED
  readonly sequence: number
  readonly persistenceId: string
} | {
  readonly _tag: typeof JOINED
  readonly sequence: number
  readonly persistenceId: string
}

/**
 * @since 1.0.0
 */
export function schema<A, IA, E, IE>(success: Schema.Schema<A, IA>, failure: Schema.Schema<E, IE>): Schema.Schema<
  DurableExecutionEvent<A, E>,
  DurableExecutionEventFrom<IA, IE>
> {
  return Schema.union(
    Schema.struct({
      _tag: Schema.literal(ATTEMPTED),
      sequence: Schema.number,
      version: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal(INTERRUPTION_REQUESTED),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal(COMPLETED),
      sequence: Schema.number,
      exit: Schema.exit<Schema.Schema<A, IA, never>, Schema.Schema<E, IE, never>, never>({ failure, success })
    }),
    Schema.struct({
      _tag: Schema.literal(FORKED),
      sequence: Schema.number,
      persistenceId: Schema.string
    }),
    Schema.struct({
      _tag: Schema.literal(JOINED),
      sequence: Schema.number,
      persistenceId: Schema.string
    })
  )
}

/**
 * @since 1.0.0
 */
export function match<A, E, B, C = B, D = C, F = D, G = F>(
  event: DurableExecutionEvent<A, E>,
  fns: {
    onAttempted: (event: Attempted) => B
    onInterruptionRequested: (event: InterruptionRequested) => C
    onCompleted: (event: Completed<A, E>) => D
    onForked: (event: Forked) => F
    onJoined: (event: Joined) => G
  }
) {
  switch (event._tag) {
    case ATTEMPTED:
      return fns.onAttempted(event)
    case INTERRUPTION_REQUESTED:
      return fns.onInterruptionRequested(event)
    case COMPLETED:
      return fns.onCompleted(event)
    case FORKED:
      return fns.onForked(event)
    case JOINED:
      return fns.onJoined(event)
  }
}
