import { EntityManager } from "./EntityManager";
import { Queue } from "@effect/io/Queue";
import { BinaryMessage } from "./BinaryMessage";
import * as ByteArray from "./ByteArray";
import { Deferred } from "@effect/io/Deferred";
import { Option } from "@effect/data/Option";
import { Throwable } from "./ShardError";
import * as Schema from "@effect/schema/Schema";
import * as Data from "@effect/data/Data";

export const EntityStateTypeId = Symbol.for("@effect/shardcake/EntityState");
export type EntityStateTypeId = typeof EntityStateTypeId;

export interface EntityState {
  [EntityStateTypeId]: {};
  binaryQueue: Queue<
    readonly [
      BinaryMessage,
      Deferred<Throwable, Option<ByteArray.ByteArray>>,
      Deferred<never, void>
    ]
  >;
  entityManager: EntityManager<never>;
}

export function apply(
  binaryQueue: EntityState["binaryQueue"],
  entityManager: EntityState["entityManager"]
): EntityState {
  return Data.struct({ [EntityStateTypeId]: {}, binaryQueue, entityManager });
}
