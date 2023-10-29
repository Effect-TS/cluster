/**
 * @since 1.0.0
 */
import * as Replier from "@effect/cluster/Replier";
import * as ReplyId from "@effect/cluster/ReplyId";
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
/**
 * @since 1.0.0
 * @category utils
 */
export function isMessage(value) {
  return typeof value === "object" && value !== null && "replier" in value && Replier.isReplier(value.replier);
}
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export function schema(replySchema) {
  return function (item) {
    const result = pipe(item, Schema.extend(Schema.struct({
      replier: Replier.schema(replySchema)
    })));
    const make = (arg, replyId) => Data.struct({
      ...arg,
      replier: Replier.replier(replyId, replySchema)
    });
    const makeEffect = arg => pipe(ReplyId.makeEffect, Effect.map(replyId => make(arg, replyId)));
    return {
      ...result,
      make,
      makeEffect
    };
  };
}
//# sourceMappingURL=Message.mjs.map