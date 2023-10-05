/**
 * @since 1.0.0
 */
import type * as ShardingError from "@effect/cluster/ShardingError"
import type * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Queue from "effect/Queue"
import * as Stream from "effect/Stream"
import * as Take from "effect/Take"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/cluster/ReplyChannel"

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
  /**
   * @since 1.0.0
   */
  readonly output: Stream.Stream<never, ShardingError.ShardingError, A>
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

/**
 * Construct a new `ReplyChannel` from a queue.
 *
 * @internal
 */
export function fromQueue<A>(queue: Queue.Queue<Take.Take<ShardingError.ShardingError, A>>): ReplyChannel<A> {
  const end = pipe(Queue.offer(queue, Take.end), Effect.exit, Effect.asUnit)
  const fail = (cause: Cause.Cause<ShardingError.ShardingError>) =>
    pipe(Queue.offer(queue, Take.failCause(cause)), Effect.exit, Effect.asUnit)
  const await_ = Queue.awaitShutdown(queue)
  return ({
    _id: TypeId,
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

/** @internal */
export const make = <A>() =>
  pipe(
    Queue.unbounded<Take.Take<ShardingError.ShardingError, A>>(),
    Effect.map(fromQueue)
  )
