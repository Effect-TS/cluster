/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingEntityNotManagedByThisPodErrorTag = "@effect/shardcake/ShardingEntityNotManagedByThisPodError";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingEntityNotManagedByThisPodErrorSchema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingEntityNotManagedByThisPodErrorTag),
  entityId: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingEntityNotManagedByThisPodError(entityId) {
  return Data.struct({
    _tag: ShardingEntityNotManagedByThisPodErrorTag,
    entityId
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingEntityNotManagedByThisPodError(value) {
  return value && "_tag" in value && value._tag === ShardingEntityNotManagedByThisPodErrorTag;
}
//# sourceMappingURL=ShardingEntityNotManagedByThisPodError.mjs.map