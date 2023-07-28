import type * as Schema from "@effect/schema/Schema";
import * as ShardId from "@effect/shardcake/ShardId";
import type { JsonData } from "@effect/shardcake/utils";
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityType<Msg> {
    _tag: "EntityType";
    name: string;
    schema: Schema.Schema<JsonData, Msg>;
}
/**
 * @since 1.0.0
 * @category models
 */
export interface TopicType<Msg> {
    _tag: "TopicType";
    name: string;
    schema: Schema.Schema<JsonData, Msg>;
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
export declare function makeEntityType<I extends JsonData, Msg>(name: string, schema: Schema.Schema<I, Msg>): EntityType<Msg>;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function makeTopicType<I extends JsonData, Msg>(name: string, schema: Schema.Schema<I, Msg>): TopicType<Msg>;
/**
 * Gets the shard id where this entity should run.
 * @since 1.0.0
 * @category utils
 */
export declare const getShardId: (entityId: string, numberOfShards: number) => ShardId.ShardId;
//# sourceMappingURL=RecipientType.d.ts.map