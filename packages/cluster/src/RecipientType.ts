/**
 * @since 1.0.0
 */
import type * as Message from "@effect/cluster/Message"
import type * as Schema from "@effect/schema/Schema"
import * as Hash from "effect/Hash"
import * as ShardId from "./ShardId.js"

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg extends Message.Message.Any> {
  readonly _tag: "EntityType"
  readonly name: string
  readonly schema: Schema.Schema<Msg, unknown>
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg extends Message.Message.Any> {
  readonly _tag: "TopicType"
  readonly name: string
  readonly schema: Schema.Schema<Msg, unknown>
}

/**
 * An abstract type to extend for each type of entity or topic
 * @since 1.0.0
 * @category models
 */
export type RecipientType<Msg extends Message.Message.Any> = EntityType<Msg> | TopicType<Msg>

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeEntityType<Msg extends Message.Message.Any, I>(
  name: string,
  schema: Schema.Schema<Msg, I>
): EntityType<Msg> {
  return { _tag: "EntityType", name, schema: schema as any }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeTopicType<Msg extends Message.Message.Any, I>(
  name: string,
  schema: Schema.Schema<Msg, I>
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
