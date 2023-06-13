import * as Schema from "@effect/schema/Schema";
import * as ShardId from "./ShardId";
import * as BinaryMessage from "./BinaryMessage";

export const AssignShard_ = Schema.struct({
  _tag: Schema.literal("AssignShards"),
  shards: Schema.array(ShardId.schema),
});

export const UnassignShards_ = Schema.struct({
  _tag: Schema.literal("UnassignShards"),
  shards: Schema.array(ShardId.schema),
});

export const Send_ = Schema.struct({
  _tag: Schema.literal("Send"),
  message: BinaryMessage.schema,
});

export const PingShards_ = Schema.struct({
  _tag: Schema.literal("PingShards"),
});

export const schema = Schema.union(AssignShard_, UnassignShards_, Send_, PingShards_);
