/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Queue from "effect/Queue";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/PoisonPill";
/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make = /*#__PURE__*/Data.struct({
  _id: TypeId
});
/**
 * @since 1.0.0
 * @category utils
 */
export function isPoisonPill(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId)
}));
/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category schema
 */
export function takeOrInterrupt(dequeue) {
  return pipe(Queue.take(dequeue), Effect.flatMap(msg => isPoisonPill(msg) ? Effect.interrupt : Effect.succeed(msg)));
}
//# sourceMappingURL=PoisonPill.mjs.map