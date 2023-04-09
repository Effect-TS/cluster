import { Option } from "@effect/data/Option";
import * as Data from "@effect/data/Data";

/**
 * @since 1.0.0
 * @category symbols
 */
export const BinaryMessageTypeId: unique symbol = Symbol.for("@effect/shardcake/BinaryMessage");

/**
 * @since 1.0.0
 * @category symbols
 */
export type BinaryMessageTypeId = typeof BinaryMessageTypeId;

export interface BinaryMessage {
  [BinaryMessageTypeId]: {};
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
  return Data.struct({ [BinaryMessageTypeId]: {}, entityId, entityType, body, replyId });
}

export type ByteArray = unknown;
