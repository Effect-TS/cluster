import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/cluster/ReplyChannel";
/**
 * @since 1.0.0
 * @category utils
 */
export function isReplyChannel(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * Construct a new `ReplyChannel` from a deferred.
 *
 * @internal
 */
export function fromDeferred(deferred) {
  const fail = cause => pipe(Deferred.failCause(deferred, cause), Effect.asUnit);
  return {
    _id: TypeId,
    await: pipe(Deferred.await(deferred), Effect.exit, Effect.asUnit),
    fail,
    reply: a => pipe(Deferred.succeed(deferred, Option.some(a)), Effect.asUnit),
    output: pipe(Deferred.await(deferred), Effect.onError(fail))
  };
}
/** @internal */
export const make = () => pipe(Deferred.make(), Effect.map(fromDeferred));
//# sourceMappingURL=ReplyChannel.mjs.map