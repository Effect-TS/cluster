import * as Data from "effect/Data"
import type * as Effect from "effect/Effect"
import type * as Fiber from "effect/Fiber"
import type * as HashMap from "effect/HashMap"
import * as Option from "effect/Option"
import type * as Scope from "effect/Scope"
import type * as RefSynchronized from "effect/SynchronizedRef"
import type * as ReplyId from "../ReplyId.js"
import type * as ShardingError from "../ShardingError.js"
import type * as ReplyChannel from "./replyChannel.js"

/** @internal */
const EntityStateSymbolKey = "@effect/cluster/EntityState"

/** @internal */
export const EntityStateTypeId = Symbol.for(EntityStateSymbolKey)

/** @internal */
export type EntityStateTypeId = typeof EntityStateTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityState<Req> {
  readonly [EntityStateTypeId]: EntityStateTypeId
  readonly offer: (message: Req) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
  readonly replyChannels: RefSynchronized.SynchronizedRef<
    HashMap.HashMap<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>
  >
  readonly expirationFiber: Fiber.RuntimeFiber<never, void>
  readonly executionScope: Scope.CloseableScope
  readonly terminationFiber: Option.Option<Fiber.RuntimeFiber<never, void>>
  readonly lastReceivedAt: number
}

/** @internal */
export function make<Req>(
  data: Omit<EntityState<Req>, EntityStateTypeId>
): EntityState<Req> {
  return Data.struct({ [EntityStateTypeId]: EntityStateTypeId, ...data })
}

/** @internal */
export function withTerminationFiber(
  terminationFiber: Fiber.RuntimeFiber<never, void>
): <Req>(entityState: EntityState<Req>) => EntityState<Req> {
  return (entityState) => ({ ...entityState, terminationFiber: Option.some(terminationFiber) })
}

/** @internal */
export function withExpirationFiber(
  expirationFiber: Fiber.RuntimeFiber<never, void>
): <Req>(entityState: EntityState<Req>) => EntityState<Req> {
  return (entityState) => ({ ...entityState, expirationFiber })
}

/** @internal */
export function withLastReceivedAd(
  lastReceivedAt: number
): <Req>(entityState: EntityState<Req>) => EntityState<Req> {
  return (entityState) => ({ ...entityState, lastReceivedAt })
}
