/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect"
import * as Schema from "@effect/schema/Schema"
import * as ReplyId from "@effect/shardcake/ReplyId"
import * as Sharding from "@effect/shardcake/Sharding"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/Replier"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface Replier<R> {
  [TypeId]: {}
  id: ReplyId.ReplyId
  schema: Schema.Schema<R>
  reply: (reply: R) => Effect.Effect<Sharding.Sharding, never, void>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const replier = <R>(id: ReplyId.ReplyId, schema: Schema.Schema<R>): Replier<R> => {
  const self: Replier<R> = {
    [TypeId]: {},
    id,
    schema,
    reply: (reply) => Effect.flatMap(Sharding.Sharding, (_) => _.reply(reply, self))
  }
  return self
}

/** @internal */
export function isReplier<R>(value: unknown): value is Replier<R> {
  return typeof value === "object" && value !== null && TypeId in value
}

/**
 * @since 1.0.0
 * @category schema
 */
export const schema = <A>(schema: Schema.Schema<A>): Schema.Schema<Replier<A>> => {
  return Schema.transform(
    ReplyId.schema,
    Schema.unknown,
    (id) => replier(id, schema) as any,
    (_) => {
      return (_ as any).id
    }
  ) as any
}
