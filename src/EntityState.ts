import { EntityManager } from "./EntityManager";
import { Queue } from "@effect/io/Queue";
import { BinaryMessage, ByteArray } from "./BinaryMessage";
import { Deferred } from "@effect/io/Deferred";
import { Option } from "@fp-ts/core/Option";
import { Throwable } from "./ShardError";
import * as Schema from "@fp-ts/schema/Schema";
import * as Data from "@fp-ts/data/Data";

export const TypeId = Symbol.for("@effect/shardcake/EntityState");
export type TypeId = typeof TypeId;

export interface EntityState {
  [TypeId]: {};
  binaryQueue: Queue<
    readonly [
      BinaryMessage,
      Option<Schema.Schema<any>>,
      Deferred<Throwable, Option<ByteArray>>,
      Deferred<never, void>
    ]
  >;
  entityManager: EntityManager<never>;
}

export function apply(
  binaryQueue: EntityState["binaryQueue"],
  entityManager: EntityState["entityManager"]
): EntityState {
  return Data.struct({ [TypeId]: {}, binaryQueue, entityManager });
}
