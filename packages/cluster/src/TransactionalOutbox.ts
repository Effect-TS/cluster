/**
 * @since 1.0.0
 */
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as PrimaryKey from "effect/PrimaryKey"
import * as RecipientBehaviourContext from "./RecipientBehaviourContext.js"
import type * as RecipientType from "./RecipientType.js"
import * as Serialization from "./Serialization.js"
import type * as SerializedMessage from "./SerializedMessage.js"
import type * as Sharding from "./Sharding.js"

export interface TransactionalOutboxTransaction {
  readonly checkIfAcknowledged: (
    recipientName: string,
    entityId: string,
    messageId: string
  ) => Effect.Effect<never, never, boolean>

  readonly markAsAcknowledged: (
    recipientName: string,
    entityId: string,
    messageId: string
  ) => Effect.Effect<never, never, void>

  readonly persistMessageToSend: (
    recipientName: string,
    entityId: string,
    messageId: string,
    message: SerializedMessage.SerializedMessage
  ) => Effect.Effect<never, never, void>
}

const TransactionalOutboxTransaction = Context.Tag<TransactionalOutboxTransaction>()

export function sendDiscard<Msg>(
  recipientType: RecipientType.RecipientType<Msg>
) {
  return (entityId: string) => <A extends Msg & PrimaryKey.PrimaryKey>(msg: A) =>
    Effect.gen(function*(_) {
      const serialization = yield* _(Serialization.Serialization)
      const outbox = yield* _(TransactionalOutboxTransaction)

      const messageId = PrimaryKey.value(msg)
      const body = yield* _(serialization.encode(recipientType.schema, msg))

      return yield* _(outbox.persistMessageToSend(recipientType.name, entityId, messageId, body))
    })
}

export function processAndAcknowledge<Msg extends PrimaryKey.PrimaryKey>(
  message: Msg
) {
  return <R, E, A>(process: Effect.Effect<R, E, A>) =>
    Effect.gen(function*(_) {
      const outbox = yield* _(TransactionalOutboxTransaction)
      const currentEntity = yield* _(RecipientBehaviourContext.RecipientBehaviourContext)

      const messageId = PrimaryKey.value(message)

      const alreadyProcessed = yield* _(
        outbox.checkIfAcknowledged(currentEntity.recipientType.name, currentEntity.entityId, messageId)
      )

      if (!alreadyProcessed) {
        yield* _(process)
        yield* _(outbox.markAsAcknowledged(currentEntity.recipientType.name, currentEntity.entityId, messageId))
      }
    })
}

export interface TransactionalOutboxSweeper {
  readonly sweepAndSend: Effect.Effect<Sharding.Sharding, never, void>
}
