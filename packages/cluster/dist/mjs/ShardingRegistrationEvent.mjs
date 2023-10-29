/**
 * @since 1.0.0
 * @category constructors
 */
export function EntityRegistered(entityType) {
  return {
    _tag: "EntityRegistered",
    entityType
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function SingletonRegistered(name) {
  return {
    _tag: "SingletonRegistered",
    name
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function TopicRegistered(topicType) {
  return {
    _tag: "TopicRegistered",
    topicType
  };
}
//# sourceMappingURL=ShardingRegistrationEvent.mjs.map