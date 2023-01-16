import { EntityManager } from "./EntityManager";
import { Queue } from "@effect/io/Queue";
import { BinaryMessage, ByteArray } from "./BinaryMessage";
import { Deferred } from "@effect/io/Deferred";
import { Option } from "@fp-ts/data/Option";
import { Throwable } from "./ShardError";

export interface EntityState {
  binaryQueue: Queue<
    readonly [BinaryMessage, Deferred<Throwable, Option<ByteArray>>, Deferred<never, void>]
  >;
  entityManager: EntityManager<never>;
}

export function EntityState(args: EntityState): EntityState {
  return args;
}
