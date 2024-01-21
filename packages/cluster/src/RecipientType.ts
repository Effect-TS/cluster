/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import * as Hash from "effect/Hash"
import * as ShardId from "./ShardId.js"

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg> {
  readonly _tag: "EntityType"
  readonly name: string
  readonly schema: Schema.Schema<unknown, Msg>
  readonly messageToId: (msg: Msg) => string
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg> {
  readonly _tag: "TopicType"
  readonly name: string
  readonly schema: Schema.Schema<unknown, Msg>
  readonly messageToId: (msg: Msg) => string
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
  schema: Schema.Schema<I, Msg>,
  messageToId: (msg: Msg) => string
): EntityType<Msg> {
  return { _tag: "EntityType", name, schema: schema as any, messageToId }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function makeTopicType<I, Msg>(
  name: string,
  schema: Schema.Schema<I, Msg>,
  messageToId: (msg: Msg) => string
): TopicType<Msg> {
  return { _tag: "TopicType", name, schema: schema as any, messageToId }
}

/**
 * Gets the shard id where this entity should run.
 * @since 1.0.0
 * @category utils
 */
export const getShardId = (entityId: string, numberOfShards: number): ShardId.ShardId =>
  ShardId.make(Math.abs(Hash.string(entityId) % numberOfShards) + 1)
