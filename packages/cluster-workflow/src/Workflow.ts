import type * as ParseResult from "@effect/schema/ParseResult"
import * as Schema from "@effect/schema/Schema"
import * as Exit from "effect/Exit"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import * as WorkflowEvent from "@effect/cluster-workflow/WorkflowEvent"
import * as WorkflowJournal  from "./WorkflowJournal.js"
import * as Serialization from "@effect/cluster/Serialization"

export interface WorkflowContext {
  persistenceId: string
  attempt: number
}

export const WorkflowContext = Context.Tag<WorkflowContext>()

function getState(persistenceId: string): Effect.Effect<WorkflowStorage, never, WorkflowStepState>{
  return Effect.flatMap(WorkflowStorage, storage => pipe(
    storage.readJournal(persistenceId),
    Stream.runFold({ attempt: 0, exit: Option.none() }, stateMachine)
  ))
}

export function step<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(
    fa: Effect.Effect<R, E, A>
  ): Effect.Effect<R | WorkflowJournal.WorkflowJournal, E | WorkflowDeserializationFailure, A> =>
    Effect.gen(function*(_) {
      const storage = yield* _(WorkflowJournal.WorkflowJournal)
      const journal = storage.readJournal(persistenceId)

      if (Option.isNone(state.exit)) {
        return yield* _(, Effect.exit, Effect.tap(exit => storage.persistJournal(persistenceId, new WorkflowStepCompleted({ sequence: 0, exit}))))
      } else {
        const exit = yield* _(Schema.parse(Schema.exit(failure, success))(state.exit.value))
        return yield* _(exit)
      }
    })
}

export const currentAttempt = Effect.map(WorkflowContext, (_) => _.attempt)
