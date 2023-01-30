import * as Equal from "@fp-ts/data/Equal";
import * as Schema from "@fp-ts/schema/Schema";
import * as ShardId from "./ShardId";
import * as Hash from "@fp-ts/data/Hash";

/**
 * An abstract type to extend for each type of entity or topic
 * @param name a unique string that identifies this entity or topic type
 * @tparam Msg the type of message that can be sent to this entity or topic type
 */

export interface EntityType<Msg> {
  _tag: "EntityType";
  name: string;
  schema: Schema.Schema<Msg>;
}
export interface TopicType<Msg> {
  _tag: "TopicType";
  name: string;
  schema: Schema.Schema<Msg>;
}
export type RecipentType<Msg> = EntityType<Msg> | TopicType<Msg>;

export const getShardId = (entityId: string, numberOfShards: number): ShardId.ShardId =>
  ShardId.shardId(Math.abs(Hash.string(entityId) % numberOfShards) + 1);

export function EntityType<Msg>(name: string, schema: Schema.Schema<Msg>): EntityType<Msg> {
  return { _tag: "EntityType", name, schema };
}
