/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorEntityNotManagedByThisPodTag = "@effect/sharding/ShardingErrorEntityNotManagedByThisPod";
const ShardingErrorEntityNotManagedByThisPodSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorEntityNotManagedByThisPodTag),
  entityId: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorEntityNotManagedByThisPod(entityId) {
  return Data.struct({
    _tag: ShardingErrorEntityNotManagedByThisPodTag,
    entityId
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorEntityNotManagedByThisPod(value) {
  return value && "_tag" in value && value._tag === ShardingErrorEntityNotManagedByThisPodTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorEntityNotManagedByThisPodSchema = ShardingErrorEntityNotManagedByThisPodSchema_;
//# sourceMappingURL=ShardingErrorEntityNotManagedByThisPod.mjs.map