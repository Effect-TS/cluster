/**
 * @since 1.0.0
 */
import * as AtLeastOnceStorage from "@effect/cluster/AtLeastOnceStorage"
import * as Serialization from "@effect/cluster/Serialization"
import * as SerializedEnvelope from "@effect/cluster/SerializedEnvelope"
import * as SerializedMessage from "@effect/cluster/SerializedMessage"
import * as Pg from "@sqlfx/pg"
import type * as PgError from "@sqlfx/pg/Error"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as PrimaryKey from "effect/PrimaryKey"
import * as Stream from "effect/Stream"

/**
 * @since 1.0.0
 * @category constructors
 */
export const atLeastOnceStoragePostgres: Layer.Layer<
  AtLeastOnceStorage.AtLeastOnceStorage,
  PgError.SqlError,
  Serialization.Serialization | Pg.PgClient
> = Layer.effect(
  AtLeastOnceStorage.Tag,
  Effect.gen(function*(_) {
    const sql = yield* _(Pg.tag)
    const serialization = yield* _(Serialization.Serialization)

    yield* _(sql`
    CREATE TABLE IF NOT EXISTS message_ack
    (
        recipient_name varchar(255) NOT NULL,
        shard_id integer DEFAULT 0,
        entity_id varchar(255) NOT NULL,
        message_id varchar(255) NOT NULL,
        message_body text NOT NULL,
        processed boolean DEFAULT FALSE NOT NULL,
        CONSTRAINT message_ack_pkey PRIMARY KEY (recipient_name, entity_id, message_id)
    )
    `)

    return AtLeastOnceStorage.make({
      upsert: (recipientType, shardId, entityId, message) =>
        pipe(
          serialization.encode(recipientType.schema, message),
          Effect.flatMap(
            (message_body) =>
              sql`INSERT INTO message_ack ${
                sql.insert({
                  recipient_name: recipientType.name,
                  shard_id: shardId.value,
                  entity_id: entityId,
                  message_id: PrimaryKey.value(message),
                  message_body: message_body.value
                })
              } ON CONFLICT ON CONSTRAINT message_ack_pkey DO NOTHING`
          ),
          Effect.catchAllCause(Effect.logError)
        ),
      markAsProcessed: (recipientType, shardId, entityId, message) =>
        pipe(
          sql`UPDATE message_ack SET processed = TRUE WHERE
                recipient_name = ${(recipientType.name)}
                AND entity_id = ${(entityId)}
                AND message_id = ${(PrimaryKey.value(message))}`,
          Effect.catchAllCause(Effect.logError)
        ),
      sweepPending: (shardIds) =>
        pipe(
          sql<{
            recipient_name: string
            entity_id: string
            message_id: string
            message_body: string
          }>`SELECT * FROM message_ack WHERE processed = FALSE AND shard_id IN ${
            sql(Array.from(shardIds).map((_) => _.value))
          }`.stream,
          Stream.orDie,
          Stream.map((_) =>
            SerializedEnvelope.make(_.recipient_name, _.entity_id, SerializedMessage.make(_.message_body))
          )
        )
    })
  })
)
