/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/cluster/SerializedMessage";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface SerializedMessage extends Schema.Schema.To<typeof schema> {
}
/**
 * Construct a new `SerializedMessage` from its internal string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export declare function make(value: string): SerializedMessage;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isSerializedMessage(value: unknown): value is SerializedMessage;
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/cluster/SerializedMessage";
    readonly value: string;
}, Data.Data<{
    readonly _id: "@effect/cluster/SerializedMessage";
    readonly value: string;
}>>;
/**
 * This is the schema for a value starting from a string.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schemaFromString: Schema.Schema<string, SerializedMessage>;
//# sourceMappingURL=SerializedMessage.d.ts.map