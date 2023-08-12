/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/ByteArray";
/**
 * @since 1.0.0
 * @category models
 */
export interface ByteArray extends Schema.To<typeof schema> {
}
/**
 * Construct a new `ByteArray` from its internal string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export declare function make(value: string): ByteArray;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isByteArray(value: unknown): value is ByteArray;
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/shardcake/ByteArray";
    readonly value: string;
}, Data.Data<{
    readonly _id: "@effect/shardcake/ByteArray";
    readonly value: string;
}>>;
/**
 * This is the schema for a value starting from a string.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schemaFromString: Schema.Schema<string, ByteArray>;
//# sourceMappingURL=ByteArray.d.ts.map