/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Replier from "@effect/sharding/Replier";
import * as Data from "effect/Data";
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
    const make = arg => replyId => Data.struct({
      ...arg,
      replier: Replier.replier(replyId, replySchema)
    });
    return [result, make];
  };
}
//# sourceMappingURL=Message.mjs.map