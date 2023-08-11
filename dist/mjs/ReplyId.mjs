/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import * as crypto from "crypto";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/ReplyId";
/**
 * @since 1.0.0
 * @category utils
 */
export function isReplyId(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * Construct a new `ReplyId` from its internal id string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(value) {
  return Data.struct({
    _id: TypeId,
    value
  });
}
/** @internal */
const makeUUID = typeof crypto !== undefined && typeof crypto.getRandomValues === "function" ? /*#__PURE__*/Effect.sync(() =>
// @ts-expect-error
([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))) : /*#__PURE__*/Effect.sync(() => (Math.random() * 10000).toString(36));
/**
 * Construct a new `ReplyId` by internally building a UUID.
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeEffect = /*#__PURE__*/Effect.map(make)(makeUUID);
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  value: Schema.string
}));
//# sourceMappingURL=ReplyId.mjs.map