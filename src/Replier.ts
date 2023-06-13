import * as Sharding from "./Sharding";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { pipe } from "@effect/data/Function";
import * as Option from "@effect/data/Option";
import * as ReplyId from "./ReplyId";

export const ReplierTypeId = Symbol.for("@effect/shardcake/Replier");

export interface Replier<R> {
  [ReplierTypeId]: {};
  id: ReplyId.ReplyId;
  schema: Schema.Schema<R>;
  reply: (reply: R) => Effect.Effect<Sharding.Sharding, never, void>;
}

export const replier = <R>(id: ReplyId.ReplyId, schema: Schema.Schema<R>): Replier<R> => {
  const self: Replier<R> = {
    [ReplierTypeId]: {},
    id,
    schema,
    reply: (reply) => Effect.flatMap(Sharding.Sharding, (_) => _.reply(reply, self)),
  };
  return self;
};

export function isReplier<R>(value: unknown): value is Replier<R> {
  return typeof value === "object" && value !== null && ReplierTypeId in value;
}

/**
 * @since 1.0.0
 */
export const schema = <A>(schema: Schema.Schema<A>): Schema.Schema<Replier<A>> => {
  return Schema.transform(
    ReplyId.schema,
    Schema.unknown,
    (id) => replier(id, schema) as any,
    (_) => {
      return (_ as any).id;
    }
  ) as any;
};
