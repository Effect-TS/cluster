import * as Schema from "@effect/schema/Schema"
import * as TreeFormatter from "@effect/schema/TreeFormatter"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import type * as Serialization from "../Serialization.js"
import * as SerializedMessage from "../SerializedMessage.js"
import * as ShardingError from "../ShardingError.js"

/** @internal */
const SerializationSymbolKey = "@effect/cluster/Serialization"

/** @internal */
export const SerializationTypeId: Serialization.SerializationTypeId = Symbol.for(
  SerializationSymbolKey
) as Serialization.SerializationTypeId

/** @internal */
export const serializationTag = Context.Tag<Serialization.Serialization>(SerializationTypeId)

/** @internal */
function jsonStringify<I, A>(value: A, schema: Schema.Schema<I, A>) {
  return pipe(
    value,
    Schema.encode(schema),
    Effect.mapError((e) => ShardingError.ShardingErrorSerialization(TreeFormatter.formatError(e))),
    Effect.map((_) => JSON.stringify(_))
  )
}

/** @internal */
function jsonParse<I, A>(value: string, schema: Schema.Schema<I, A>) {
  return pipe(
    Effect.sync(() => JSON.parse(value)),
    Effect.flatMap(Schema.decode(schema)),
    Effect.mapError((e) => ShardingError.ShardingErrorSerialization(TreeFormatter.formatError(e)))
  )
}

/** @internal */
export function make(
  args: Omit<Serialization.Serialization, Serialization.SerializationTypeId>
): Serialization.Serialization {
  return ({ ...args, [SerializationTypeId]: SerializationTypeId })
}

/** @internal */
export const json: Layer.Layer<never, never, Serialization.Serialization> = Layer.succeed(
  serializationTag,
  make({
    encode: (schema, message) =>
      pipe(
        jsonStringify(message, schema),
        Effect.map(SerializedMessage.make)
      ),
    decode: (schema, body) => jsonParse(body.value, schema)
  })
)
