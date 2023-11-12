/** @internal */
import type * as Cause from "effect/Cause"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import type * as ShardingError from "../ShardingError.js"

/** @internal */
const ReplyChannelSymbolKey = "@effect/cluster/ReplyChannel"

/** @internal */
export const ReplyChannelTypeId = Symbol.for(ReplyChannelSymbolKey)

/** @internal */
export type ReplyChannelTypeId = typeof ReplyChannelTypeId

/** @internal */
export interface ReplyChannel<A> {
  /**
   * @since 1.0.0
   */
  readonly [ReplyChannelTypeId]: ReplyChannelTypeId
  /**
   * @since 1.0.0
   */
  readonly await: Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  readonly fail: (
    cause: Cause.Cause<ShardingError.ShardingErrorEntityNotManagedByThisPod>
  ) => Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  readonly reply: (
    value: A
  ) => Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  readonly output: Effect.Effect<never, ShardingError.ShardingErrorEntityNotManagedByThisPod, Option.Option<A>>
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isReplyChannel(value: unknown): value is ReplyChannel<any> {
  return (
    typeof value === "object" &&
    value !== null &&
    ReplyChannelTypeId in value &&
    value[ReplyChannelTypeId] === ReplyChannelTypeId
  )
}

/**
 * Construct a new `ReplyChannel` from a deferred.
 *
 * @internal
 */
export function fromDeferred<A>(
  deferred: Deferred.Deferred<ShardingError.ShardingErrorEntityNotManagedByThisPod, Option.Option<A>>
): ReplyChannel<A> {
  const fail = (cause: Cause.Cause<ShardingError.ShardingErrorEntityNotManagedByThisPod>) =>
    pipe(Deferred.failCause(deferred, cause), Effect.asUnit)
  return ({
    [ReplyChannelTypeId]: ReplyChannelTypeId,
    await: pipe(Deferred.await(deferred), Effect.exit, Effect.asUnit),
    fail,
    reply: (a) => pipe(Deferred.succeed(deferred, Option.some(a)), Effect.asUnit),
    output: pipe(
      Deferred.await(deferred),
      Effect.onError(fail)
    )
  })
}

/** @internal */
export const make = <A>() =>
  pipe(
    Deferred.make<ShardingError.ShardingErrorEntityNotManagedByThisPod, Option.Option<A>>(),
    Effect.map(fromDeferred)
  )