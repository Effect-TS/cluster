import * as Sharding from "./Sharding";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { pipe } from "@effect/data/Function";
import * as Option from "@effect/data/Option";
import { IdentifierId } from "@effect/schema/annotation/AST";
import * as H from "@effect/schema/annotation/Hook";

export interface Replier<R> {
  id: string;
  reply: (reply: R) => Effect.Effect<Sharding.Sharding, never, void>;
}

export const replier = <R>(id: string, replySchema: Schema.Schema<R>): Replier<R> => {
  const self: Replier<R> = {
    id,
    reply: (reply) => Effect.serviceWithEffect(Sharding.Sharding, (_) => _.reply(reply, self)),
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
