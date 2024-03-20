/**
 * @since 1.0.0
 */
import type * as Message from "@effect/cluster/Message"
import type * as RecipientType from "./RecipientType.js"

/**
 * @since 1.0.0
 * @category models
 */
interface EntityRegistered<Msg extends Message.Message.Any> {
  _tag: "EntityRegistered"
  entityType: RecipientType.EntityType<Msg>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function EntityRegistered<Msg extends Message.Message.Any>(
  entityType: RecipientType.EntityType<Msg>
): ShardingRegistrationEvent {
  return ({ _tag: "EntityRegistered", entityType })
}

/**
 * @since 1.0.0
 * @category models
 */
interface SingletonRegistered {
  _tag: "SingletonRegistered"
  name: string
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function SingletonRegistered(name: string): ShardingRegistrationEvent {
  return ({ _tag: "SingletonRegistered", name })
}

/**
 * @since 1.0.0
 * @category models
 */
interface TopicRegistered<Msg extends Message.Message.Any> {
  _tag: "TopicRegistered"
  topicType: RecipientType.TopicType<Msg>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function TopicRegistered<Msg extends Message.Message.Any>(
  topicType: RecipientType.TopicType<Msg>
): ShardingRegistrationEvent {
  return ({ _tag: "TopicRegistered", topicType })
}

/**
 * @since 1.0.0
 * @category models
 */
export type ShardingRegistrationEvent =
  | EntityRegistered<any>
  | SingletonRegistered
  | TopicRegistered<any>
