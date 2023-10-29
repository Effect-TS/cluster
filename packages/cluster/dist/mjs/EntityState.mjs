import * as Data from "effect/Data";
import * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/cluster/EntityState");
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(data) {
  return Data.struct({
    _id: TypeId,
    ...data
  });
}
/**
 * @since 1.0.0
 * @category modifiers
 */
export function withoutMessageQueue(entityState) {
  return {
    ...entityState,
    messageQueue: Option.none()
  };
}
/**
 * @since 1.0.0
 * @category modifiers
 */
export function withExpirationFiber(expirationFiber) {
  return entityState => ({
    ...entityState,
    expirationFiber
  });
}
//# sourceMappingURL=EntityState.mjs.map