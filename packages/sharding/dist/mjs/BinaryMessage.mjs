/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as ByteArray from "@effect/sharding/ByteArray";
import * as ReplyId from "@effect/sharding/ReplyId";
import * as Data from "effect/Data";
import { pipe } from "effect/Function";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/BinaryMessage";
/**
 * Construct a new `BinaryMessage`
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(entityId, entityType, body, replyId) {
  return Data.struct({
    _id: TypeId,
    entityId,
    entityType,
    body,
    replyId
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isBinaryMessage(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/pipe( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  entityId: Schema.string,
  entityType: Schema.string,
  body: ByteArray.schema,
  replyId: /*#__PURE__*/Schema.option(ReplyId.schema)
}), Schema.data);
//# sourceMappingURL=BinaryMessage.mjs.map