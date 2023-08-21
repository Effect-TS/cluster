import type * as Schema from "@effect/schema/Schema";
import * as ShardId from "@effect/shardcake/ShardId";
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg> {
    readonly _tag: "EntityType";
    readonly name: string;
    readonly schema: Schema.Schema<unknown, Msg>;
}
/**
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg> {
    readonly _tag: "TopicType";
    readonly name: string;
    readonly schema: Schema.Schema<unknown, Msg>;
}
/**
 * An abstract type to extend for each type of entity or topic
 * @since 1.0.0
 * @category models
 */
export type RecipientType<Msg> = EntityType<Msg> | TopicType<Msg>;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function makeEntityType<I, Msg>(name: string, schema: Schema.Schema<I, Msg>): EntityType<Msg>;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function makeTopicType<I, Msg>(name: string, schema: Schema.Schema<I, Msg>): TopicType<Msg>;
/**
 * Gets the shard id where this entity should run.
 * @since 1.0.0
 * @category utils
 */
export declare const getShardId: (entityId: string, numberOfShards: number) => ShardId.ShardId;
//# sourceMappingURL=RecipientType.d.ts.map