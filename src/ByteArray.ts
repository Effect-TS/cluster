import * as Schema from "@effect/schema/Schema";
import * as Data from "@effect/data/Data";

export const ByteArrayTypeId = "@effect/shardcake/ByteArray";

export function isByteArray(value: unknown): value is ByteArray {
  return (
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    value["_tag"] === ByteArrayTypeId
  );
}

export const schema = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ByteArrayTypeId),
    value: Schema.string,
  })
);

export interface ByteArray extends Schema.To<typeof schema> {}

export function byteArray(value: string): ByteArray {
  return Data.struct({ _tag: ByteArrayTypeId, value });
}
