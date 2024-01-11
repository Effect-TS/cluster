import { Schema } from "@effect/schema"
import type * as Exit from "effect/Exit"

export interface ActivityAttempted {
  _tag: "ActivityAttempted"
  sequence: number
}

export function ActivityAttempted(sequence: number): ActivityEvent<never, never> {
  return ({ _tag: "ActivityAttempted", sequence })
}

export interface ActivityCompleted<E, A> {
  _tag: "ActivityCompleted"
  sequence: number
  exit: Exit.Exit<E, A>
}

export function ActivityCompleted<E, A>(sequence: number, exit: Exit.Exit<E, A>): ActivityEvent<E, A> {
  return ({ _tag: "ActivityCompleted", sequence, exit })
}

export type ActivityEvent<E, A> = ActivityAttempted | ActivityCompleted<E, A>

export type ActivityEventFrom<IE, IA> = {
  readonly _tag: "ActivityAttempted"
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
      _tag: Schema.literal("ActivityCompleted"),
      sequence: Schema.number,
      exit: Schema.exit(failure, success)
    })
  )
}

export function match<E, A, B, C = B>(
  fns: {
    onAttempted: (event: ActivityAttempted) => B
    onCompleted: (event: ActivityCompleted<E, A>) => C
  }
) {
  return (event: ActivityEvent<E, A>) => {
    switch (event._tag) {
      case "ActivityAttempted":
        return fns.onAttempted(event)
      case "ActivityCompleted":
        return fns.onCompleted(event)
    }
  }
}
