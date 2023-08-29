/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/PodAddress";
/**
 * @since 1.0.0
 * @category utils
 */
export function isPodAddress(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(host, port) {
  return Data.struct({
    _id: TypeId,
    host,
    port
  });
}
/** @internal */
export function show(podAddress) {
  return `http://${podAddress.host}:${podAddress.port}`;
}
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  host: Schema.string,
  port: Schema.number
}));
//# sourceMappingURL=PodAddress.mjs.map