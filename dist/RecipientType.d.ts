import type * as Effect from "@effect/io/Effect";
import type * as Queue from "@effect/io/Queue";
import type * as Schema from "@effect/schema/Schema";
import type { JsonData } from "@effect/shardcake/JsonData";
import type * as PoisonPill from "@effect/shardcake/PoisonPill";
import * as ShardId from "@effect/shardcake/ShardId";
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
/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Req> {
    (entityId: string, dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>): Effect.Effect<R, never, void>;
}
//# sourceMappingURL=RecipientType.d.ts.map