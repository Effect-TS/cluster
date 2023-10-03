import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/sharding/EntityState");
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(entityManager) {
  return Data.struct({
    _id: TypeId,
    entityManager
  });
}
//# sourceMappingURL=EntityState.mjs.map