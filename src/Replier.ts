import * as Sharding from "./Sharding";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@fp-ts/schema/Schema";

export interface Replier<R> {
  id: string;
  reply: (reply: R) => Effect.Effect<Sharding.Sharding, never, void>;
  schema: Schema.Schema<R>;
}

export const replier = <R>(id: string, schema: Schema.Schema<R>): Replier<R> => {
  const self: Replier<R> = {
    id,
    reply: (reply) => Effect.serviceWithEffect(Sharding.Sharding)((_) => _.reply(reply, self)),
    schema,
  };
  return self;
};

export function schema<A>(base: Schema.Schema<A>): Schema.Schema<Replier<A>> {
  return Schema.any as any;
}
