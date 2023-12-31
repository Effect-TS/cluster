/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import * as Hash from "effect/Hash"
import type * as Message from "./Message.js"
import * as ShardId from "./ShardId.js"

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg extends Message.Any> {
  readonly _tag: "EntityType"
  readonly name: string
  readonly schema: Schema.Schema<unknown, Msg>
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg extends Message.Any> {
  readonly _tag: "TopicType"
  readonly name: string
  readonly schema: Schema.Schema<unknown, Msg>
}

/**
 * An abstract type to extend for each type of entity or topic
 * @since 1.0.0
 * @category models
 */
export type RecipientType<Msg extends Message.Any> = EntityType<Msg> | TopicType<Msg>

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeEntityType<I, Msg extends Message.Any>(
  name: string,
  schema: Schema.Schema<I, Msg>
): EntityType<Msg> {
  return { _tag: "EntityType", name, schema: schema as any }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeTopicType<I, Msg extends Message.Any>(
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
