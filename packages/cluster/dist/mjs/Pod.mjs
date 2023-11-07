/**
 * @since 1.0.0
 */
import * as PodAddress from "@effect/cluster/PodAddress";
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import { pipe } from "effect/Function";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/cluster/Pod";
/**
 * @since 1.0.0
 * @category utils
 */
export function isPod(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(address, version) {
  return Data.struct({
    _id: TypeId,
    address,
    version
  });
}
/** @internal */
export function show(value) {
  return "Pod(address=" + value.address + ", version=" + value.version + ")";
}
/**
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/pipe( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  address: PodAddress.schema,
  version: Schema.string
}), Schema.data);
//# sourceMappingURL=Pod.mjs.map