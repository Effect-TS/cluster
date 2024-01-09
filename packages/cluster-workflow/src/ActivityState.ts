import type * as Exit from "effect/Exit"
import * as Option from "effect/Option"

export interface ActivityState<E, A> {
  exit: Option.Option<Exit.Exit<E, A>>
  currentAttempt: number
  sequence: number
}

export function initialState<E, A>(): ActivityState<E, A> {
  return ({ currentAttempt: 0, exit: Option.none(), sequence: 0 })
}
