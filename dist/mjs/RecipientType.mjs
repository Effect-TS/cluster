/**
 * @since 1.0.0
 */
import * as Hash from "@effect/data/Hash";
import * as ShardId from "@effect/shardcake/ShardId";
/**
 * @since 1.0.0
 * @category constructors
 */
export function makeEntityType(name, schema) {
  return {
    _tag: "EntityType",
    name,
    schema
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function makeTopicType(name, schema) {
  return {
    _tag: "TopicType",
    name,
    schema
  };
}
/**
 * Gets the shard id where this entity should run.
 * @since 1.0.0
 * @category utils
 */
export const getShardId = (entityId, numberOfShards) => ShardId.make(Math.abs(Hash.string(entityId) % numberOfShards) + 1);
//# sourceMappingURL=RecipientType.mjs.map