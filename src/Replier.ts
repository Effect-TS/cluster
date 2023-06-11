import * as Sharding from "./Sharding";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { pipe } from "@effect/data/Function";
import * as Option from "@effect/data/Option";

export interface Replier<R> {
  id: string;
  schema: Schema.Schema<R>;
  reply: (reply: R) => Effect.Effect<Sharding.Sharding, never, void>;
}

const Replier = Schema.struct({
  id: Schema.required(Schema.string),
  reply: Schema.required(Schema.any),
});

export const replier = <R>(id: string, schema: Schema.Schema<R>): Replier<R> => {
  const self: Replier<R> = {
    id,
    schema,
    reply: (reply) => Effect.flatMap(Sharding.Sharding, (_) => _.reply(reply, self)),
  };
  return self;
};

/**
 * @since 1.0.0
 */
export const schema = <A>(value: Schema.Schema<A>): Schema.Schema<Replier<A>> => {
  return Schema.transform(
    Schema.string,
    Schema.unknown,
    (id) => replier(id, value),
    (_) => (_ as any).id
  ) as any;
};
