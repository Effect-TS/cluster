/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Effect from "@effect/io/Effect";
import * as Queue from "@effect/io/Queue";
import * as Schema from "@effect/schema/Schema";
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
  return Effect.flatMap(msg => isPoisonPill(msg) ? Effect.interrupt : Effect.succeed(msg))(Queue.take(dequeue));
}
//# sourceMappingURL=PoisonPill.mjs.map