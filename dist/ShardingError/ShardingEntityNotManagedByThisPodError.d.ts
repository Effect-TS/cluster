/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingEntityNotManagedByThisPodErrorTag: "@effect/shardcake/ShardingEntityNotManagedByThisPodError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingEntityNotManagedByThisPodErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingEntityNotManagedByThisPodError";
    readonly entityId: string;
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingEntityNotManagedByThisPodError";
    readonly entityId: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingEntityNotManagedByThisPodError extends Schema.To<typeof ShardingEntityNotManagedByThisPodErrorSchema> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingEntityNotManagedByThisPodError(entityId: string): ShardingEntityNotManagedByThisPodError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingEntityNotManagedByThisPodError(value: any): value is ShardingEntityNotManagedByThisPodError;
//# sourceMappingURL=ShardingEntityNotManagedByThisPodError.d.ts.map