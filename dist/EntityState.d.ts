import type * as Option from "@effect/data/Option";
import type * as Effect from "@effect/io/Effect";
import type * as Schema from "@effect/schema/Schema";
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage";
import type * as EntityManager from "@effect/shardcake/EntityManager";
import type * as ReplyChannel from "@effect/shardcake/ReplyChannel";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId: unique symbol;
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityState {
    readonly _id: TypeId;
    readonly entityManager: EntityManager.EntityManager<never>;
    readonly processBinary: (binaryMessage: BinaryMessage.BinaryMessage, replyChannel: ReplyChannel.ReplyChannel<any>) => Effect.Effect<never, never, Option.Option<Schema.Schema<unknown, any>>>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make(entityManager: EntityState["entityManager"], processBinary: EntityState["processBinary"]): EntityState;
//# sourceMappingURL=EntityState.d.ts.map