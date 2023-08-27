/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect"
import * as Schema from "@effect/schema/Schema"
import * as ReplyId from "@effect/sharding/ReplyId"
import * as Sharding from "@effect/sharding/Sharding"
import type * as Stream from "@effect/stream/Stream"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/StreamReplier"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface StreamReplier<A> {
  _id: TypeId
  id: ReplyId.ReplyId
  schema: Schema.Schema<unknown, A>
  reply: (reply: Stream.Stream<never, never, A>) => Effect.Effect<Sharding.Sharding, never, void>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const streamReplier = <I, A>(
  id: ReplyId.ReplyId,
  schema: Schema.Schema<I, A>
): StreamReplier<A> => {
  const self: StreamReplier<A> = {
    _id: TypeId,
    id,
    schema: schema as any,
    reply: (reply) => Effect.flatMap(Sharding.Sharding, (_) => _.replyStream(reply, self))
  }
  return self
}

/** @internal */
export function isStreamReplier<R>(value: unknown): value is StreamReplier<R> {
  return typeof value === "object" && value !== null && "_id" in value && value._id === TypeId
}

/**
 * @since 1.0.0
 * @category schema
 */
export const schema = <I, A>(schema: Schema.Schema<I, A>): Schema.Schema<I, StreamReplier<A>> => {
  return Schema.transform(
    ReplyId.schema,
    Schema.unknown,
    (id) => streamReplier(id, schema) as any,
    (_) => {
      return (_ as any).id
    }
  ) as any
}
