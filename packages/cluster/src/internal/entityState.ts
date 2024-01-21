import * as Data from "effect/Data"
import type * as Effect from "effect/Effect"
import type * as Fiber from "effect/Fiber"
import * as Option from "effect/Option"
import type * as Scope from "effect/Scope"
import type * as Message from "../Message.js"
import type * as MessageState from "../MessageState.js"
import type * as ShardingError from "../ShardingError.js"

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
export interface EntityState<Msg> {
  readonly [EntityStateTypeId]: EntityStateTypeId
  readonly sendAndGetState: <A extends Msg>(
    message: Msg
  ) => Effect.Effect<
    never,
    ShardingError.ShardingErrorWhileOfferingMessage,
    MessageState.MessageState<Message.MessageWithResult.Exit<A>>
  >
  readonly expirationFiber: Fiber.RuntimeFiber<never, void>
  readonly executionScope: Scope.CloseableScope
  readonly terminationFiber: Option.Option<Fiber.RuntimeFiber<never, void>>
  readonly lastReceivedAt: number
}

/** @internal */
export function make<Msg>(
  data: Omit<EntityState<Msg>, EntityStateTypeId>
): EntityState<Msg> {
  return Data.struct({ [EntityStateTypeId]: EntityStateTypeId, ...data })
}

/** @internal */
export function withTerminationFiber(
  terminationFiber: Fiber.RuntimeFiber<never, void>
): <Msg>(entityState: EntityState<Msg>) => EntityState<Msg> {
  return (entityState) => ({ ...entityState, terminationFiber: Option.some(terminationFiber) })
}

/** @internal */
export function withExpirationFiber(
  expirationFiber: Fiber.RuntimeFiber<never, void>
): <Msg>(entityState: EntityState<Msg>) => EntityState<Msg> {
  return (entityState) => ({ ...entityState, expirationFiber })
}

/** @internal */
export function withLastReceivedAd(
  lastReceivedAt: number
): <Msg>(entityState: EntityState<Msg>) => EntityState<Msg> {
  return (entityState) => ({ ...entityState, lastReceivedAt })
}
