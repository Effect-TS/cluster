/**
 * @since 1.0.0
 */
import type * as Message from "@effect/cluster/Message"
import type * as Schema from "@effect/schema/Schema"
import * as Hash from "effect/Hash"
import * as ShardId from "./ShardId.js"

/**
 * An EntityType is a RecipientType that is ensured to be alive only on a single Pod at a time.
 *
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg extends Message.Message.Any> {
  readonly _tag: "EntityType"
  readonly name: string
  readonly schema: Schema.Schema<Msg, unknown>
}

/**
 * A TopicType can live on multiple Pods at the same time.
 *
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg extends Message.Message.Any> {
  readonly _tag: "TopicType"
  readonly name: string
  readonly schema: Schema.Schema<Msg, unknown>
}

/**
 * A RecipientType is basically a pointer to a logical grouping of multiple enties having the same RecipientBehaviour.
 * This value is required to be able to message with an entity/topic since it holds the Schema for the messages over the wire.
 * Without the schema, you cannot ensure that the messages sent are what the receiver expects.
 * Ideally, you can share this definition between the caller and the receiver.
 *
 * @since 1.0.0
 * @category models
 */
export type RecipientType<Msg extends Message.Message.Any> = EntityType<Msg> | TopicType<Msg>

/**
 * Given a name and a schema for the protocol, constructs an EntityType.
 *
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
 * Given a name and a schema for the protocol, constructs an TopicType.
 *
 * @since 1.0.0
 * @category constructors
 */
export function makeTopicType<Msg extends Message.Message.Any, I>(
  name: string,
  schema: Schema.Schema<Msg, I>
): TopicType<Msg> {
  return { _tag: "TopicType", name, schema: schema as any }
}

/** @internal */
export const getShardId = (entityId: string, numberOfShards: number): ShardId.ShardId =>
  ShardId.make(Math.abs(Hash.string(entityId) % numberOfShards) + 1)
