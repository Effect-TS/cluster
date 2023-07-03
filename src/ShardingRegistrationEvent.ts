/**
 * @since 1.0.0
 */
import type * as RecipientType from "@effect/shardcake/RecipientType"

/** @interal */
interface EntityRegistered<A> {
  _tag: "EntityRegistered"
  entityType: RecipientType.RecipientType<A>
}

/** @interal */
interface SingletonRegistered {
  _tag: "SingletonRegistered"
  name: string
}

/** @interal */
interface TopicRegistered<A> {
  _tag: "TopicRegistered"
  topicType: RecipientType.RecipientType<A>
}

/**
 * @since 1.0.0
 * @category models
 */
export type ShardingRegistrationEvent =
  | EntityRegistered<any>
  | SingletonRegistered
  | TopicRegistered<any>
