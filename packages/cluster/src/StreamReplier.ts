/**
 * @since 1.0.0
 */
import * as ReplyId from "@effect/cluster/ReplyId"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/cluster/StreamReplier"

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
    schema: schema as any
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
