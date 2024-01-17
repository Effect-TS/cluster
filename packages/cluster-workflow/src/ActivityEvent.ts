import { Schema } from "@effect/schema"
import type * as Exit from "effect/Exit"

export interface ActivityAttempted {
  _tag: "ActivityAttempted"
  sequence: number
}

export function ActivityAttempted(sequence: number): ActivityEvent<never, never> {
  return ({ _tag: "ActivityAttempted", sequence })
}

export interface ActivityInterruptionRequested {
  _tag: "ActivityInterruptionRequested"
  sequence: number
}

export function ActivityInterruptionRequested(sequence: number): ActivityInterruptionRequested {
  return ({ _tag: "ActivityInterruptionRequested", sequence })
}

export interface ActivityCompleted<E, A> {
  _tag: "ActivityCompleted"
  sequence: number
  exit: Exit.Exit<E, A>
}

export function ActivityCompleted<E, A>(exit: Exit.Exit<E, A>) {
  return (sequence: number): ActivityEvent<E, A> => ({ _tag: "ActivityCompleted", sequence, exit })
}

export type ActivityEvent<E, A> =
  | ActivityAttempted
  | ActivityInterruptionRequested
  | ActivityCompleted<E, A>

export type ActivityEventFrom<IE, IA> = {
  readonly _tag: "ActivityAttempted"
  readonly sequence: number
} | {
  readonly _tag: "ActivityInterruptionRequested"
  readonly sequence: number
} | {
  readonly _tag: "ActivityCompleted"
  readonly sequence: number
  readonly exit: Schema.ExitFrom<IE, IA>
}

export function schema<IE, E, IA, A>(failure: Schema.Schema<IE, E>, success: Schema.Schema<IA, A>): Schema.Schema<
  ActivityEventFrom<IE, IA>,
  ActivityEvent<E, A>
> {
  return Schema.union(
    Schema.struct({
      _tag: Schema.literal("ActivityAttempted"),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal("ActivityInterruptionRequested"),
      sequence: Schema.number
    }),
    Schema.struct({
      _tag: Schema.literal("ActivityCompleted"),
      sequence: Schema.number,
      exit: Schema.exit(failure, success)
    })
  )
}

export function match<E, A, B, C = B, D = C>(
  fns: {
    onAttempted: (event: ActivityAttempted) => B
    onInterruptionRequested: (event: ActivityInterruptionRequested) => C
    onCompleted: (event: ActivityCompleted<E, A>) => D
  }
) {
  return (event: ActivityEvent<E, A>) => {
    switch (event._tag) {
      case "ActivityAttempted":
        return fns.onAttempted(event)
      case "ActivityInterruptionRequested":
        return fns.onInterruptionRequested(event)
      case "ActivityCompleted":
        return fns.onCompleted(event)
    }
  }
}
