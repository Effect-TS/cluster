/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/sharding/PoisonPill";
/**
 * @since 1.0.0
 * @category models
 */
export interface PoisonPill extends Schema.Schema.To<typeof schema> {
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
    readonly _id: "@effect/sharding/PoisonPill";
}, Data.Data<{
    readonly _id: "@effect/sharding/PoisonPill";
}>>;
/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category schema
 */
export declare function takeOrInterrupt<Req>(dequeue: Queue.Dequeue<Req | PoisonPill>): Effect.Effect<never, never, Req>;
//# sourceMappingURL=PoisonPill.d.ts.map