/**
 * @since 1.0.0
 */
import * as Hash from "@effect/data/Hash"
import type * as Schema from "@effect/schema/Schema"
import * as ShardId from "@effect/shardcake/ShardId"

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg> {
  _tag: "EntityType"
  name: string
  schema: Schema.Schema<unknown, Msg>
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg> {
  _tag: "TopicType"
  name: string
  schema: Schema.Schema<unknown, Msg>
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
export function makeEntityType<I, Msg>(
  name: string,
  schema: Schema.Schema<I, Msg>
): EntityType<Msg> {
  return { _tag: "EntityType", name, schema: schema as any }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeTopicType<I, Msg>(
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
