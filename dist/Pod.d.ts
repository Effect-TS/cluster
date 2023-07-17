/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/shardcake/PodAddress";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/Pod";
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
 * @category constructors
 */
export declare function make(address: PodAddress.PodAddress, version: string): Pod;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/shardcake/Pod";
    readonly address: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
    readonly version: string;
}, Data.Data<{
    readonly _id: "@effect/shardcake/Pod";
    readonly address: Data.Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
    readonly version: string;
}>>;
//# sourceMappingURL=Pod.d.ts.map