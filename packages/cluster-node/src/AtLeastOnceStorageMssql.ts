import * as AtLeastOnceStorage from "@effect/cluster/AtLeastOnceStorage"
import * as Message from "@effect/cluster/Message"
import * as Serialization from "@effect/cluster/Serialization"
import * as MsSql from "@sqlfx/mssql"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Secret from "effect/Secret"
import * as Stream from "effect/Stream"

export const atLeastOnceStorageMssql = Layer.effect(
  AtLeastOnceStorage.Tag,
  Effect.gen(function*(_) {
    const sql = yield* _(MsSql.tag)
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
  }).pipe(Effect.provide(MsSql.makeLayer({
    server: Config.succeed("localhost"),
    domain: Config.succeed("localhost\\sql2017"),
    database: Config.succeed("cluster"),
    username: Config.succeed("sa"),
    password: Config.succeed(Secret.fromString(""))
  })))
)
