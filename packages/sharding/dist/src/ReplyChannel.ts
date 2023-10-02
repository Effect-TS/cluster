/**
 * @since 1.0.0
 */
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import type * as Cause from "effect/Cause"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Queue from "effect/Queue"
import type * as ShardingError from "@effect/sharding/ShardingError"
import * as Stream from "effect/Stream"
import * as Take from "effect/Take"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/ReplyChannel"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyChannel<A> {
  /**
   * @since 1.0.0
   */
  readonly _id: TypeId
  /**
   * @since 1.0.0
   */
  readonly await: Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  readonly end: Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  readonly fail: (cause: Cause.Cause<ShardingError.ShardingError>) => Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  readonly replySingle: (a: A) => Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  readonly replyStream: (
    stream: Stream.Stream<never, ShardingError.ShardingError, A>
  ) => Effect.Effect<never, never, void>
}

/** @internal */
export interface QueueReplyChannel<A> extends ReplyChannel<A> {
  /**
   * @since 1.0.0
   */
  readonly _tag: "FromQueue"
  /**
   * @since 1.0.0
   */
  readonly output: Stream.Stream<never, ShardingError.ShardingError, A>
}

/** @internal */
export interface DeferredReplyChannel<A> extends ReplyChannel<A> {
  /**
   * @since 1.0.0
   */
  readonly _tag: "FromDeferred"
  /**
   * @since 1.0.0
   */
  readonly output: Effect.Effect<never, ShardingError.ShardingError, Option.Option<A>>
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isReplyChannel(value: unknown): value is ReplyChannel<any> {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/** @internal */
export function isReplyChannelFromQueue(value: unknown): value is QueueReplyChannel<any> {
  return (
    isReplyChannel(value) &&
    "_tag" in value &&
    value["_tag"] === "FromQueue"
  )
}

/** @internal */
export function isReplyChannelFromDeferred(value: unknown): value is DeferredReplyChannel<any> {
  return (
    isReplyChannel(value) &&
    "_tag" in value &&
    value["_tag"] === "FromDeferred"
  )
}

/**
 * Construct a new `ReplyChannel` from a queue.
 *
 * @internal
 */
export function fromQueue<A>(queue: Queue.Queue<Take.Take<ShardingError.ShardingError, A>>): QueueReplyChannel<A> {
  const end = pipe(Queue.offer(queue, Take.end), Effect.exit, Effect.asUnit)
  const fail = (cause: Cause.Cause<ShardingError.ShardingError>) =>
    pipe(Queue.offer(queue, Take.failCause(cause)), Effect.exit, Effect.asUnit)
  const await_ = Queue.awaitShutdown(queue)
  return ({
    _id: TypeId,
    _tag: "FromQueue",
    await: await_,
    end,
    fail,
    replySingle: (a) => pipe(Queue.offer(queue, Take.of(a)), Effect.exit, Effect.zipRight(end)),
    replyStream: (stream) =>
      pipe(
        Stream.runForEach(stream, (a) => Queue.offer(queue, Take.of(a))),
        Effect.onExit((_) =>
          Queue.offer(queue, Exit.match(_, { onFailure: (e) => Take.failCause(e), onSuccess: () => Take.end }))
        ),
        Effect.race(await_),
        Effect.fork,
        Effect.asUnit
      ),
    output: pipe(
      Stream.fromQueue(queue, { shutdown: true }),
      Stream.flattenTake,
      Stream.onError(fail)
    )
  })
}

/**
 * Construct a new `ReplyChannel` from a deferred.
 *
 * @internal
 */
export function fromDeferred<A>(
  deferred: Deferred.Deferred<ShardingError.ShardingError, Option.Option<A>>
): DeferredReplyChannel<A> {
  const end = pipe(Deferred.succeed(deferred, Option.none()), Effect.asUnit)
  const fail = (cause: Cause.Cause<ShardingError.ShardingError>) =>
    pipe(Deferred.failCause(deferred, cause), Effect.asUnit)
  return ({
    _id: TypeId,
    _tag: "FromDeferred",
    await: pipe(Deferred.await(deferred), Effect.exit, Effect.asUnit),
    end,
    fail,
    replySingle: (a) => pipe(Deferred.succeed(deferred, Option.some(a)), Effect.asUnit),
    replyStream: (stream) =>
      pipe(
        Stream.runHead(stream),
        Effect.flatMap((_) => Deferred.succeed(deferred, _)),
        Effect.catchAllCause(fail),
        Effect.fork,
        Effect.asUnit
      ),
    output: pipe(
      Deferred.await(deferred),
      Effect.onError(fail)
    )
  })
}

/** @internal */
export const single = <A>() =>
  pipe(
    Deferred.make<ShardingError.ShardingError, Option.Option<A>>(),
    Effect.map(fromDeferred)
  )

/** @internal */
export const stream = <A>() =>
  pipe(
    Queue.unbounded<Take.Take<ShardingError.ShardingError, A>>(),
    Effect.map(fromQueue)
  )
