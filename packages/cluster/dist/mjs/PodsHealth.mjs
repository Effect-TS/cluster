import * as Pods from "@effect/cluster/Pods";
import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/cluster/PodsHealth");
/**
 * @since 1.0.0
 * @category context
 */
export const PodsHealth = /*#__PURE__*/Tag();
/**
 * A layer that considers pods as always alive.
 * This is useful for testing only.
 * @since 1.0.0
 * @category layers
 */
export const noop = /*#__PURE__*/Layer.succeed(PodsHealth, {
  _id: TypeId,
  isAlive: () => Effect.succeed(true)
});
/**
 * A layer that pings the pod directly to check if it's alive.
 * This is useful for developing and testing but not reliable in production.
 * @since 1.0.0
 * @category layers
 */
export const local = /*#__PURE__*/Layer.effect(PodsHealth, /*#__PURE__*/Effect.map(Pods.Pods, podApi => ({
  _id: TypeId,
  isAlive: address => pipe(podApi.ping(address), Effect.option, Effect.map(Option.isSome))
})));
//# sourceMappingURL=PodsHealth.mjs.map