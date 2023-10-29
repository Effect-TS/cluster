/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingErrorEntityNotManagedByThisPodTag: "@effect/cluster/ShardingErrorEntityNotManagedByThisPod";
declare const ShardingErrorEntityNotManagedByThisPodSchema_: Schema.Schema<{
    readonly _tag: "@effect/cluster/ShardingErrorEntityNotManagedByThisPod";
    readonly entityId: string;
}, Data.Data<{
    readonly _tag: "@effect/cluster/ShardingErrorEntityNotManagedByThisPod";
    readonly entityId: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorEntityNotManagedByThisPod extends Schema.Schema.To<typeof ShardingErrorEntityNotManagedByThisPodSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingErrorEntityNotManagedByThisPod(entityId: string): ShardingErrorEntityNotManagedByThisPod;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingErrorEntityNotManagedByThisPod(value: any): value is ShardingErrorEntityNotManagedByThisPod;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorEntityNotManagedByThisPodSchema: Schema.Schema<Schema.Schema.From<typeof ShardingErrorEntityNotManagedByThisPodSchema_>, ShardingErrorEntityNotManagedByThisPod>;
export {};
//# sourceMappingURL=ShardingErrorEntityNotManagedByThisPod.d.ts.map