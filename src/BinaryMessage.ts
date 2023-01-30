import { Option } from "@fp-ts/core/Option";

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

export function binaryMessage(
  entityId: string,
  entityType: string,
  body: unknown,
  replyId: Option<string>
): BinaryMessage {
  return { [BinaryMessageTypeId]: {}, entityId, entityType, body, replyId };
}

export type ByteArray = unknown;
