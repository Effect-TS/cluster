import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/cluster/StorageTypeId");
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
    saveAssignments: assignments => pipe(assignmentsRef, SubscriptionRef.set(assignments)),
    assignmentsStream: assignmentsRef.changes,
    getPods: Ref.get(podsRef),
    savePods: pods => pipe(podsRef, Ref.set(pods))
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