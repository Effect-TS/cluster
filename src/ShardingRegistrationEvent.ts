/**
 * @since 1.0.0
 */
import type * as RecipientType from "@effect/sharding/RecipientType"

/**
 * @since 1.0.0
 * @category models
 */
interface EntityRegistered<A> {
  _tag: "EntityRegistered"
  entityType: RecipientType.EntityType<A>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function EntityRegistered<A>(entityType: RecipientType.EntityType<A>): ShardingRegistrationEvent {
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
interface TopicRegistered<A> {
  _tag: "TopicRegistered"
  topicType: RecipientType.TopicType<A>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function TopicRegistered<A>(topicType: RecipientType.TopicType<A>): ShardingRegistrationEvent {
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
