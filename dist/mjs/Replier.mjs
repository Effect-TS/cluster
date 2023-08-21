/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import * as ReplyId from "@effect/shardcake/ReplyId";
import * as Sharding from "@effect/shardcake/Sharding";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/Replier";
/**
 * @since 1.0.0
 * @category constructors
 */
export const replier = (id, schema) => {
  const self = {
    _id: TypeId,
    id,
    schema: schema,
    reply: reply => Effect.flatMap(Sharding.Sharding, _ => _.reply(reply, self))
  };
  return self;
};
/**
 * @since 1.0.0
 * @category utils
 */
export function isReplier(value) {
  return typeof value === "object" && value !== null && TypeId in value;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const schema = schema => {
  return Schema.transform(ReplyId.schema, Schema.unknown, id => replier(id, schema), _ => {
    return _.id;
  });
};
//# sourceMappingURL=Replier.mjs.map