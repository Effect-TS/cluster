import * as Equal from "@fp-ts/data/Equal";
import * as ShardId from "./ShardId";
/**
 * An abstract type to extend for each type of entity or topic
 * @param name a unique string that identifies this entity or topic type
 * @tparam Msg the type of message that can be sent to this entity or topic type
 */

export interface EntityType<Msg> {
  _tag: "EntityType";
  name: string;
}
export interface TopicType<Msg> {
  _tag: "TopicType";
  name: string;
}
export type RecipentType<Msg> = EntityType<Msg> | TopicType<Msg>;

export const getShardId = (entityId: string, numberOfShards: number): ShardId.ShardId =>
  ShardId.shardId(Math.abs(Equal.hash(entityId) % numberOfShards) + 1);
