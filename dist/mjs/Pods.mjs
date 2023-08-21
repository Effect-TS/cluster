/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Stream from "@effect/stream/Stream";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/Pods");
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