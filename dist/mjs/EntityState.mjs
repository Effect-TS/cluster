/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/EntityState");
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(entityManager, processBinary) {
  return Data.struct({
    _id: TypeId,
    entityManager,
    processBinary
  });
}
//# sourceMappingURL=EntityState.mjs.map