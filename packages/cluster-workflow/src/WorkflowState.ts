import * as WorkflowEvent from "@effect/cluster-workflow/WorkflowEvent"
import * as WorkflowJournal from "@effect/cluster-workflow/WorkflowJournal"
import * as Effect from "effect/Effect"
import type * as Either from "effect/Either"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"

export interface WorkflowState<E, A> {
  exit: Option.Option<Either.Either<E, A>>
  attempt: number
}

function stateMachine<E, A>(state: WorkflowState<E, A>, event: WorkflowStepEvent): WorkflowStepState {
  switch (event._tag) {
    case "WorkflowStepStarted":
      return ({ ...state, attempt: state.attempt + 1 })
    case "WorkflowStepCompleted":
      return ({ ...state, exit: Option.some(event.exit) })
    default:
      return state
  }
}

export function readState(persistenceId: string) {
  return Effect.flatMap(WorkflowJournal.WorkflowJournal, (journal) =>
    pipe(
      journal.readJournal(persistenceId),
      Stream.runDrain()
    ))
}
