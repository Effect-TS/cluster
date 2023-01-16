import { EntityManager } from "./EntityManager";
import { Queue } from "@effect/io/Queue";
import { BinaryMessage, ByteArray } from "./BinaryMessage";
import { Deferred } from "@effect/io/Deferred";
import { Option } from "@fp-ts/data/Option";

export interface EntityState {
  binaryQueue: Queue<[BinaryMessage, Deferred<never, Option<ByteArray>>, Deferred<never, void>]>;
  entityManager: EntityManager<never>;
}
