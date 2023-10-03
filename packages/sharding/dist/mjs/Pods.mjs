import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/sharding/Pods");
/**
 * @since 1.0.0
 * @category context
 */
export const Pods = /*#__PURE__*/Tag();
/**
 * A layer that creates a service that does nothing when called.
 * Useful for testing ShardManager or when using Sharding.local.
 *
 * @since 1.0.0
 * @category layers
 */
export const noop = /*#__PURE__*/Layer.succeed(Pods, {
  _id: TypeId,
  assignShards: () => Effect.unit,
  unassignShards: () => Effect.unit,
  ping: () => Effect.unit,
  sendMessage: () => Effect.succeed(Option.none()),
  sendMessageStreaming: () => Stream.empty
});
//# sourceMappingURL=Pods.mjs.map