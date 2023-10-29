"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntityRegistered = EntityRegistered;
exports.SingletonRegistered = SingletonRegistered;
exports.TopicRegistered = TopicRegistered;
/**
 * @since 1.0.0
 * @category constructors
 */
function EntityRegistered(entityType) {
  return {
    _tag: "EntityRegistered",
    entityType
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function SingletonRegistered(name) {
  return {
    _tag: "SingletonRegistered",
    name
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function TopicRegistered(topicType) {
  return {
    _tag: "TopicRegistered",
    topicType
  };
}
//# sourceMappingURL=ShardingRegistrationEvent.js.map