/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as ReplyId from "@effect/sharding/ReplyId";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/StreamReplier";
/**
 * @since 1.0.0
 * @category constructors
 */
export const streamReplier = (id, schema) => {
  const self = {
    _id: TypeId,
    id,
    schema: schema
  };
  return self;
};
/** @internal */
export function isStreamReplier(value) {
  return typeof value === "object" && value !== null && "_id" in value && value._id === TypeId;
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