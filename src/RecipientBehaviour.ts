/**
 * @since 1.0.0
 */
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import type * as Queue from "@effect/io/Queue"
import type * as Schema from "@effect/schema/Schema"
import type { JsonData } from "@effect/shardcake/JsonData"
import * as PoisonPill from "@effect/shardcake/PoisonPill"
import type { Throwable } from "@effect/shardcake/ShardError"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/ByteArray"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * An abstract type to extend for each type of entity or topic
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Msg> {
  readonly _id: TypeId
  readonly schema: Schema.Schema<JsonData, Msg>
  readonly dequeue: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>
  ) => Effect.Effect<R, never, void>
  readonly accept: (msg: Msg) => Effect.Effect<R, Throwable, void>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function dequeue<I extends JsonData, Msg, R>(
  schema: Schema.Schema<I, Msg>,
  dequeue: (entityId: string, dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>) => Effect.Effect<R, never, void>
): RecipientBehaviour<R, Msg> {
  return { _id: TypeId, schema: schema as any, dequeue, accept: () => Effect.unit }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function process<I extends JsonData, Msg, R>(
  schema: Schema.Schema<I, Msg>,
  process: (entityId: string, msg: Msg) => Effect.Effect<R, never, void>
): RecipientBehaviour<R, Msg> {
  return dequeue(schema, (entityId, dequeue) =>
    pipe(
      PoisonPill.takeOrInterrupt(dequeue),
      Effect.flatMap((msg) => process(entityId, msg)),
      Effect.forever
    ))
}

/**
 * @since 1.0.0
 * @category utils
 */
export function onReceive<Msg, R>(
  accept: (msg: Msg, next: RecipientBehaviour<never, Msg>["accept"]) => Effect.Effect<R, Throwable, void>
) {
  return <R1>(recipientBehaviour: RecipientBehaviour<R1, Msg>): RecipientBehaviour<R | R1, Msg> => ({
    ...recipientBehaviour,
    accept: (msg) => accept(msg, recipientBehaviour.accept as any)
  })
}
