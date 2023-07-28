/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
/**
 * @since 1.0.0
 * @category context
 */
export const Sharding = /*#__PURE__*/Tag();
/**
 * Notify the shard manager that shards can now be assigned to this pod.
 * @since 1.0.0
 * @category utils
 */
export const register = /*#__PURE__*/Effect.flatMap(Sharding, _ => _.register);
/**
 * Notify the shard manager that shards must be unassigned from this pod.
 * @since 1.0.0
 * @category utils
 */
export const unregister = /*#__PURE__*/Effect.flatMap(Sharding, _ => _.unregister);
/**
 * Same as `register`, but will automatically call `unregister` when the `Scope` is terminated.
 * @since 1.0.0
 * @category utils
 */
export const registerScoped = /*#__PURE__*/Effect.ensuring(register, unregister);
/**
 * Start a computation that is guaranteed to run only on a single pod.
 * Each pod should call `registerSingleton` but only a single pod will actually run it at any given time.
 * @since 1.0.0
 * @category utils
 */
export function registerSingleton(name, run) {
  return Effect.flatMap(Sharding, _ => _.registerSingleton(name, run));
}
/**
 * Register a new entity type, allowing pods to send messages to entities of this type.
 * It takes a `behavior` which is a function from an entity ID and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the entity receives a message).
 * If entity goes to idle timeout, it will be interrupted from outside.
 * @since 1.0.0
 * @category utils
 */
export function registerEntity(entityType, behavior, poisonPill, entityMaxIdleTime) {
  return Effect.flatMap(Sharding, _ => _.registerEntity(entityType, behavior, poisonPill, entityMaxIdleTime));
}
/**
 * Register a new topic type, allowing pods to broadcast messages to subscribers.
 * It takes a `behavior` which is a function from a topic and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the topic receives a message).
 * If entity goes to idle timeout, it will be interrupted from outside.
 * @since 1.0.0
 * @category utils
 */
export function registerTopic(topicType, behavior, poisonPill) {
  return Effect.flatMap(Sharding, _ => _.registerTopic(topicType, behavior, poisonPill));
}
/**
 * Get an object that allows sending messages to a given entity type.
 * You can provide a custom send timeout to override the one globally defined.
 * @since 1.0.0
 * @category utils
 */
export function messenger(entityType, sendTimeout) {
  return Effect.map(Sharding, _ => _.messenger(entityType, sendTimeout));
}
/**
 * Get an object that allows broadcasting messages to a given topic type.
 * You can provide a custom send timeout to override the one globally defined.
 * @since 1.0.0
 * @category utils
 */
export function broadcaster(topicType, sendTimeout) {
  return Effect.map(Sharding, _ => _.broadcaster(topicType, sendTimeout));
}
/**
 * Get the list of pods currently registered to the Shard Manager
 * @since 1.0.0
 * @category utils
 */
export const getPods = /*#__PURE__*/Effect.flatMap(Sharding, _ => _.getPods);
//# sourceMappingURL=Sharding.mjs.map