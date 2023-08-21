/**
 * @since 1.0.0
 */
import * as Hash from "@effect/data/Hash"
import type * as Effect from "@effect/io/Effect"
import type * as Queue from "@effect/io/Queue"
import type * as Schema from "@effect/schema/Schema"
import type { JsonData } from "@effect/shardcake/JsonData"
import type * as PoisonPill from "@effect/shardcake/PoisonPill"
import * as ShardId from "@effect/shardcake/ShardId"

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg> {
  _tag: "EntityType"
  name: string
  schema: Schema.Schema<JsonData, Msg>
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg> {
  _tag: "TopicType"
  name: string
  schema: Schema.Schema<JsonData, Msg>
}

/**
 * An abstract type to extend for each type of entity or topic
 * @since 1.0.0
 * @category models
 */
export type RecipientType<Msg> = EntityType<Msg> | TopicType<Msg>

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeEntityType<I extends JsonData, Msg>(
  name: string,
  schema: Schema.Schema<I, Msg>
): EntityType<Msg> {
  return { _tag: "EntityType", name, schema: schema as any }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeTopicType<I extends JsonData, Msg>(
  name: string,
  schema: Schema.Schema<I, Msg>
): TopicType<Msg> {
  return { _tag: "TopicType", name, schema: schema as any }
}

/**
 * Gets the shard id where this entity should run.
 * @since 1.0.0
 * @category utils
 */
export const getShardId = (entityId: string, numberOfShards: number): ShardId.ShardId =>
  ShardId.make(Math.abs(Hash.string(entityId) % numberOfShards) + 1)

/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Req> {
  (
    entityId: string,
    dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>
  ): Effect.Effect<R, never, void>
}
