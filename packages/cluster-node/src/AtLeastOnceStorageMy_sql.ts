/**
 * @since 1.0.0
 */
import * as AtLeastOnceStorage from "@effect/cluster/AtLeastOnceStorage"
import * as Message from "@effect/cluster/Message"
import * as Serialization from "@effect/cluster/Serialization"
import * as MySql from "@sqlfx/mysql"
import type * as MySqlError from "@sqlfx/mysql/Error"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"

/**
 * @since 1.0.0
 * @category constructors
 */
export const atLeastOnceStorageMySql: Layer.Layer<
  Serialization.Serialization | MySql.MysqlClient,
  MySqlError.SqlError,
  AtLeastOnceStorage.AtLeastOnceStorage
> = Layer.effect(
  AtLeastOnceStorage.Tag,
  Effect.gen(function*(_) {
    const sql = yield* _(MySql.tag)
    const serialization = yield* _(Serialization.Serialization)

    return AtLeastOnceStorage.make({
      upsert: (recipientType, shardId, entityId, message) =>
        pipe(
          serialization.encode(recipientType.schema, message),
          Effect.flatMap(
            (message_body) =>
              sql`INSERT INTO message_log ${
                sql.insert({
                  recipient_name: recipientType.name,
                  shard_id: shardId.value,
                  entity_id: entityId,
                  message_id: Message.messageId(message).value,
                  message_body: message_body.value
                })
              }`
          ),
          Effect.catchAllCause(Effect.logError)
        ),
      markAsProcessed: () => Effect.unit,
      sweepPending: () => Stream.empty
    })
  })
)
