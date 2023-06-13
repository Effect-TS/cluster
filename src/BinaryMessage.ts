import { Option } from "@effect/data/Option";
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
import * as ByteArray from "./ByteArray";
import * as ReplyId from "./ReplyId";

/**
 * @since 1.0.0
 * @category symbols
 */
export const BinaryMessageTypeId = "@effect/shardcake/BinaryMessage";

/**
 * @since 1.0.0
 * @category symbols
 */
export type BinaryMessageTypeId = typeof BinaryMessageTypeId;

export const schema = Schema.data(
  Schema.struct({
    _tag: Schema.literal(BinaryMessageTypeId),
    entityId: Schema.string,
    entityType: Schema.string,
    body: ByteArray.schema,
    replyId: Schema.option(ReplyId.schema),
  })
);

export interface BinaryMessage extends Schema.To<typeof schema> {}

export function binaryMessage(
  entityId: string,
  entityType: string,
  body: ByteArray.ByteArray,
  replyId: Option<ReplyId.ReplyId>
): BinaryMessage {
  return Data.struct({ _tag: BinaryMessageTypeId, entityId, entityType, body, replyId });
}
