/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as StreamReplier from "@effect/sharding/StreamReplier";
import * as Data from "effect/Data";
import { pipe } from "effect/Function";
/**
 * @since 1.0.0
 * @category utils
 */
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