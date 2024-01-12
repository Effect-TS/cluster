/**
 * @since 1.0.0
 */
import type * as ActivityEvent from "@effect/cluster-workflow/ActivityEvent"
import * as ActivityJournal from "@effect/cluster-workflow/ActivityJournal"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"

class JournalEntry extends Data.Class<{
  activityId: string
  event: ActivityEvent.ActivityEvent<any, any>
}> {
}

export const activityJournalInMemory = Layer.effect(
  ActivityJournal.ActivityJournal,
  Effect.gen(function*(_) {
    const memory = yield* _(Ref.make<Array<JournalEntry>>([]))
    return ({
      persistJournal: (activityId, _, __, event) =>
        Ref.update(memory, (_) => _.concat([new JournalEntry({ activityId, event })])),
      readJournal: (activityId) =>
        pipe(
          Ref.get(memory),
          Effect.map(Stream.fromIterable),
          Stream.unwrap,
          Stream.filter((_) => _.activityId === activityId),
          Stream.map((_) => _.event)
        )
    })
  })
)
