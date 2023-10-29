/**
 * @since 1.0.0
 */
import type * as RecipientType from "@effect/cluster/RecipientType";
/**
 * @since 1.0.0
 * @category models
 */
interface EntityRegistered<A> {
    _tag: "EntityRegistered";
    entityType: RecipientType.EntityType<A>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function EntityRegistered<A>(entityType: RecipientType.EntityType<A>): ShardingRegistrationEvent;
/**
 * @since 1.0.0
 * @category models
 */
interface SingletonRegistered {
    _tag: "SingletonRegistered";
    name: string;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function SingletonRegistered(name: string): ShardingRegistrationEvent;
/**
 * @since 1.0.0
 * @category models
 */
interface TopicRegistered<A> {
    _tag: "TopicRegistered";
    topicType: RecipientType.TopicType<A>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function TopicRegistered<A>(topicType: RecipientType.TopicType<A>): ShardingRegistrationEvent;
/**
 * @since 1.0.0
 * @category models
 */
export type ShardingRegistrationEvent = EntityRegistered<any> | SingletonRegistered | TopicRegistered<any>;
export {};
//# sourceMappingURL=ShardingRegistrationEvent.d.ts.map