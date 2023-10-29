/**
 * @since 1.0.0
 */
import * as ReplyId from "@effect/cluster/ReplyId";
import * as SerializedMessage from "@effect/cluster/SerializedMessage";
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import type * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/cluster/SerializedEnvelope";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface SerializedEnvelope extends Schema.Schema.To<typeof schema> {
}
/**
 * Construct a new `SerializedEnvelope`
 *
 * @since 1.0.0
 * @category constructors
 */
export declare function make(entityId: string, entityType: string, body: SerializedMessage.SerializedMessage, replyId: Option.Option<ReplyId.ReplyId>): SerializedEnvelope;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isSerializedEnvelope(value: unknown): value is SerializedEnvelope;
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/cluster/SerializedEnvelope";
    readonly entityId: string;
    readonly entityType: string;
    readonly body: {
        readonly _id: "@effect/cluster/SerializedMessage";
        readonly value: string;
    };
    readonly replyId: {
        readonly _tag: "None";
    } | {
        readonly _tag: "Some";
        readonly value: {
            readonly _id: "@effect/cluster/ReplyId";
            readonly value: string;
        };
    };
}, Data.Data<{
    readonly _id: "@effect/cluster/SerializedEnvelope";
    readonly entityId: string;
    readonly entityType: string;
    readonly body: Data.Data<{
        readonly _id: "@effect/cluster/SerializedMessage";
        readonly value: string;
    }>;
    readonly replyId: Option.Option<Data.Data<{
        readonly _id: "@effect/cluster/ReplyId";
        readonly value: string;
    }>>;
}>>;
//# sourceMappingURL=SerializedEnvelope.d.ts.map