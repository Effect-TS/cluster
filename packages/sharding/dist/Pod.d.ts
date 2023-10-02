/**
 * @since 1.0.0
 */
import * as Data from "effect/Data";
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/sharding/PodAddress";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/sharding/Pod";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface Pod extends Schema.To<typeof schema> {
}
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isPod(value: unknown): value is Pod;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make(address: PodAddress.PodAddress, version: string): Pod;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/sharding/Pod";
    readonly address: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
    readonly version: string;
}, Data.Data<{
    readonly _id: "@effect/sharding/Pod";
    readonly address: Data.Data<{
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
    readonly version: string;
}>>;
//# sourceMappingURL=Pod.d.ts.map
