import { Option } from "@effect/data/Option";
import * as Data from "@effect/data/Data";

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/shardcake/BinaryMessage");

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;

export interface BinaryMessage {
  [TypeId]: {};
  entityId: string;
  entityType: string;
  body: unknown;
  replyId: Option<string>;
}

export function apply(
  entityId: string,
  entityType: string,
  body: unknown,
  replyId: Option<string>
): BinaryMessage {
  return Data.struct({ [TypeId]: {}, entityId, entityType, body, replyId });
}

export type ByteArray = unknown;
