/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";
import * as StreamReplier from "@effect/shardcake/StreamReplier";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/StreamMessage");
/** @internal */
export function isStreamMessage(value) {
  return typeof value === "object" && value !== null && "replier" in value && StreamReplier.isStreamReplier(value.replier);
}
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export function schema(success) {
  return function (item) {
    const result = pipe(item, Schema.extend(Schema.struct({
      replier: StreamReplier.schema(success)
    })));
    const make = arg => replyId => Data.struct({
      ...arg,
      replier: StreamReplier.streamReplier(replyId, success)
    });
    return [result, make];
  };
}
//# sourceMappingURL=StreamMessage.mjs.map