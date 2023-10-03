/**
 * @since 1.0.0
 */
import type * as EntityManager from "@effect/sharding/EntityManager";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId: unique symbol;
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityState {
    readonly _id: TypeId;
    readonly entityManager: EntityManager.EntityManager<unknown>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make(entityManager: EntityState["entityManager"]): EntityState;
//# sourceMappingURL=EntityState.d.ts.map