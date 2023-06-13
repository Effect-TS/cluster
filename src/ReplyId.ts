import * as Schema from "@effect/schema/Schema";
import * as Data from "@effect/data/Data";

export const ReplyIdTypeId = Symbol.for("@effect/shardcake/ReplyId");

export function isReplyId(value: unknown): value is ReplyId {
  return (
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    value["_tag"] === ReplyIdTypeId
  );
}

export const schema = Schema.data(
  Schema.struct({
    _tag: Schema.uniqueSymbol(ReplyIdTypeId),
    value: Schema.string,
  })
);

export interface ReplyId extends Schema.To<typeof schema> {}

export function replyId(value: string): ReplyId {
  return Data.struct({ _tag: ReplyIdTypeId, value });
}
