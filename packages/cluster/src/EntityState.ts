/**
 * @since 1.0.0
 */
import type * as ReplyChannel from "@effect/cluster/ReplyChannel"
import type * as ReplyId from "@effect/cluster/ReplyId"
import type * as ShardingError from "@effect/cluster/ShardingError"
import * as Data from "effect/Data"
import type * as Effect from "effect/Effect"
import type * as Fiber from "effect/Fiber"
import type * as HashMap from "effect/HashMap"
import * as Option from "effect/Option"
import type * as Scope from "effect/Scope"
import type * as RefSynchronized from "effect/SynchronizedRef"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = Symbol.for("@effect/cluster/EntityState")

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityState<Req> {
  readonly _id: TypeId
  readonly offer: (message: Req) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
  readonly replyChannels: RefSynchronized.SynchronizedRef<
    HashMap.HashMap<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>
  >
  readonly expirationFiber: Fiber.RuntimeFiber<never, void>
  readonly executionScope: Scope.CloseableScope
  readonly terminationFiber: Option.Option<Fiber.RuntimeFiber<never, void>>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make<Req>(
  data: Omit<EntityState<Req>, "_id">
): EntityState<Req> {
  return Data.struct({ _id: TypeId, ...data })
}

/**
 * @since 1.0.0
 * @category modifiers
 */
export function withTerminationFiber(
  terminationFiber: Fiber.RuntimeFiber<never, void>
): <Req>(entityState: EntityState<Req>) => EntityState<Req> {
  return (entityState) => ({ ...entityState, terminationFiber: Option.some(terminationFiber) })
}

/**
 * @since 1.0.0
 * @category modifiers
 */
export function withExpirationFiber(
  expirationFiber: Fiber.RuntimeFiber<never, void>
): <Req>(entityState: EntityState<Req>) => EntityState<Req> {
  return (entityState) => ({ ...entityState, expirationFiber })
}
