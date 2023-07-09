/**
 * @since 1.0.0
 */
import { pipe } from "@effect/data/Function"
import * as Option from "@effect/data/Option"
import type * as Cause from "@effect/io/Cause"
import * as Deferred from "@effect/io/Deferred"
import * as Effect from "@effect/io/Effect"
import * as Exit from "@effect/io/Exit"
import * as Queue from "@effect/io/Queue"
import type { Throwable } from "@effect/shardcake/ShardError"
import * as Stream from "@effect/stream/Stream"
import * as Take from "@effect/stream/Take"

/**
 * @since 1.0.0
 * @category symbol
 */
export const TypeId = "@effect/shardcake/ReplyChannel"

/**
 * @since 1.0.0
 * @category symbol
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
  _id: TypeId
  /**
   * @since 1.0.0
   */
  await: Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  end: Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  fail(cause: Cause.Cause<Throwable>): Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  replySingle(a: A): Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  replyStream(stream: Stream.Stream<never, Throwable, A>): Effect.Effect<never, never, void>
}

/** @internal */
export interface QueueReplyChannel<A> extends ReplyChannel<A> {
  /**
   * @since 1.0.0
   */
  _tag: "FromQueue"
  /**
   * @since 1.0.0
   */
  output: Stream.Stream<never, Throwable, A>
}

/** @internal */
export interface DeferredReplyChannel<A> extends ReplyChannel<A> {
  /**
   * @since 1.0.0
   */
  _tag: "FromDeferred"
  /**
   * @since 1.0.0
   */
  output: Effect.Effect<never, Throwable, Option.Option<A>>
}

/** @internal */
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
export function fromQueue<A>(queue: Queue.Queue<Take.Take<Throwable, A>>): QueueReplyChannel<A> {
  const end = pipe(Queue.offer(queue, Take.end), Effect.exit, Effect.asUnit)
  const fail = (cause: Cause.Cause<Throwable>) =>
    pipe(Queue.offer(queue, Take.failCause(cause)), Effect.exit, Effect.asUnit)
  return ({
    _id: TypeId,
    _tag: "FromQueue",
    await: Queue.awaitShutdown(queue),
    end,
    fail,
    replySingle: (a) => pipe(Queue.offer(queue, Take.of(a)), Effect.exit, Effect.zipRight(end)),
    replyStream: (stream) =>
      pipe(
        Stream.runForEach(stream, (a) => Queue.offer(queue, Take.of(a))),
        Effect.onExit((_) => Queue.offer(queue, Exit.match(_, (e) => Take.failCause(e), () => Take.end))),
        Effect.fork,
        Effect.asUnit
      ),
    output: pipe(
      Stream.fromQueueWithShutdown(queue),
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
export function fromDeferred<A>(deferred: Deferred.Deferred<Throwable, Option.Option<A>>): DeferredReplyChannel<A> {
  const end = pipe(Deferred.succeed(deferred, Option.none()), Effect.asUnit)
  const fail = (cause: Cause.Cause<Throwable>) => pipe(Deferred.failCause(deferred, cause), Effect.asUnit)
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
    Deferred.make<Throwable, Option.Option<A>>(),
    Effect.map(fromDeferred)
  )

/** @internal */
export const stream = <A>() =>
  pipe(
    Queue.unbounded<Take.Take<Throwable, A>>(),
    Effect.map(fromQueue)
  )
