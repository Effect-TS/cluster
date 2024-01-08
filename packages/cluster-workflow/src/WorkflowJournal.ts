import * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import type * as Stream from "effect/Stream"
import type * as WorkflowEvent from "./WorkflowEvent.js"

export interface WorkflowJournal {
  readJournal(
    persistenceId: string
  ): Stream.Stream<never, never, WorkflowEvent.WorkflowEvent>
  persistJournal(
    persistenceId: string,
    event: WorkflowEvent.WorkflowEvent
  ): Effect.Effect<never, never, void>
}

export const WorkflowJournal = Context.Tag<WorkflowJournal>()
