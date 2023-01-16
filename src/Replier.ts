import * as Sharding from "./Sharding";
import * as Effect from "@effect/io/Effect";

export interface Replier<R> {
  id: string;
  reply: (reply: R) => Effect.Effect<Sharding.Sharding, never, void>;
}

export const replier = <R>(id: string): Replier<R> => {
  const self: Replier<R> = {
    id,
    reply: (reply) => Effect.serviceWithEffect(Sharding.Sharding)((_) => _.reply(reply, self)),
  };
  return self;
};
