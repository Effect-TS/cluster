/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as ReplyId from "@effect/sharding/ReplyId";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/Replier";
/**
 * @since 1.0.0
 * @category constructors
 */
export const replier = (id, schema) => {
  const self = {
    _id: TypeId,
    id,
    schema: schema
  };
  return self;
};
/**
 * @since 1.0.0
 * @category utils
 */
export function isReplier(value) {
  return typeof value === "object" && value !== null && "_id" in value && value._id === TypeId;
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