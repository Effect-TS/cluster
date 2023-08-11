/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import type * as Option from "@effect/data/Option";
import * as Schema from "@effect/schema/Schema";
import * as ByteArray from "@effect/shardcake/ByteArray";
import * as ReplyId from "@effect/shardcake/ReplyId";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/BinaryMessage";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface BinaryMessage extends Schema.To<typeof schema> {
}
/**
 * Construct a new `BinaryMessage`
 *
 * @since 1.0.0
 * @category constructors
 */
export declare function make(entityId: string, entityType: string, body: ByteArray.ByteArray, replyId: Option.Option<ReplyId.ReplyId>): BinaryMessage;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isBinaryMessage(value: unknown): value is BinaryMessage;
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/shardcake/BinaryMessage";
    readonly entityType: string;
    readonly entityId: string;
    readonly body: {
        readonly _id: "@effect/shardcake/ByteArray";
        readonly value: string;
    };
    readonly replyId: {
        readonly _tag: "None";
    } | {
        readonly _tag: "Some";
        readonly value: {
            readonly _id: "@effect/shardcake/ReplyId";
            readonly value: string;
        };
    };
}, Data.Data<{
    readonly _id: "@effect/shardcake/BinaryMessage";
    readonly entityType: string;
    readonly entityId: string;
    readonly body: Data.Data<{
        readonly _id: "@effect/shardcake/ByteArray";
        readonly value: string;
    }>;
    readonly replyId: Option.Option<Data.Data<{
        readonly _id: "@effect/shardcake/ReplyId";
        readonly value: string;
    }>>;
}>>;
//# sourceMappingURL=BinaryMessage.d.ts.map