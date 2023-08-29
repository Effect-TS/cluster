/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as HashMap from "@effect/data/HashMap";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Ref from "@effect/io/Ref";
import * as Stream from "@effect/stream/Stream";
import * as SubscriptionRef from "@effect/stream/SubscriptionRef";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/sharding/StorageTypeId");
/**
 * @since 1.0.0
 * @category context
 */
export const Storage = /*#__PURE__*/Tag();
/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 *
 * @since 1.0.0
 * @category layers
 */
export const memory = /*#__PURE__*/Layer.effect(Storage, /*#__PURE__*/Effect.gen(function* ($) {
  const assignmentsRef = yield* $(SubscriptionRef.make(HashMap.empty()));
  const podsRef = yield* $(Ref.make(HashMap.empty()));
  return {
    getAssignments: SubscriptionRef.get(assignmentsRef),
    saveAssignments: assignments => SubscriptionRef.set(assignments)(assignmentsRef),
    assignmentsStream: assignmentsRef.changes,
    getPods: Ref.get(podsRef),
    savePods: pods => Ref.set(pods)(podsRef)
  };
}));
/**
 * A layer that does nothing, useful for testing.
 *
 * @since 1.0.0
 * @category layers
 */
export const noop = /*#__PURE__*/Layer.effect(Storage, /*#__PURE__*/Effect.succeed({
  getAssignments: /*#__PURE__*/Effect.succeed( /*#__PURE__*/HashMap.empty()),
  saveAssignments: () => Effect.unit,
  assignmentsStream: Stream.empty,
  getPods: /*#__PURE__*/Effect.succeed( /*#__PURE__*/HashMap.empty()),
  savePods: () => Effect.unit
}));
//# sourceMappingURL=Storage.mjs.map