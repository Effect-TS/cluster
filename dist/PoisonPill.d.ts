/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/PoisonPill";
/**
 * @since 1.0.0
 * @category models
 */
export interface PoisonPill extends Schema.To<typeof schema> {
}
/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const make: PoisonPill;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isPoisonPill(value: unknown): value is PoisonPill;
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/shardcake/PoisonPill";
}, Data.Data<{
    readonly _id: "@effect/shardcake/PoisonPill";
}>>;
//# sourceMappingURL=PoisonPill.d.ts.map