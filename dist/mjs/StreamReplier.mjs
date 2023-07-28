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
export const TypeId = "@effect/shardcake/StreamReplier";
/**
 * @since 1.0.0
 * @category constructors
 */
export const streamReplier = (id, schema) => {
  const self = {
    [TypeId]: {},
    id,
    schema: schema,
    reply: reply => Effect.flatMap(Sharding.Sharding, _ => _.replyStream(reply, self))
  };
  return self;
};
/** @internal */
export function isStreamReplier(value) {
  return typeof value === "object" && value !== null && TypeId in value;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const schema = schema => {
  return Schema.transform(ReplyId.schema, Schema.unknown, id => streamReplier(id, schema), _ => {
    return _.id;
  });
};
//# sourceMappingURL=StreamReplier.mjs.map