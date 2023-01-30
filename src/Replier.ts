import * as Sharding from "./Sharding";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@fp-ts/schema/Schema";
import { pipe } from "@fp-ts/data/Function";
import type { Option } from "@fp-ts/data/Option";
import * as O from "@fp-ts/data/Option";
import { IdentifierId } from "@fp-ts/schema/annotation/AST";
import * as H from "@fp-ts/schema/annotation/Hook";

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

/**
 * @since 1.0.0
 */
export const schema = <A>(value: Schema.Schema<A>): Schema.Schema<Replier<A>> => {
  return pipe(
    Schema.string,
    Schema.transform<string, Replier<A>>(
      Schema.any,
      (id) => replier(id, value),
      (_) => _.id
    )
  );
};
