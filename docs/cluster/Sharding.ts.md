---
title: Sharding.ts
nav_order: 21
parent: "@effect/cluster"
---

## Sharding overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Tag](#tag)
- [layers](#layers)
  - [live](#live)
- [models](#models)
  - [Sharding (interface)](#sharding-interface)
- [utils](#utils)
  - [broadcaster](#broadcaster)
  - [getAssignedShardIds](#getassignedshardids)
  - [getPods](#getpods)
  - [messenger](#messenger)
  - [register](#register)
  - [registerEntity](#registerentity)
  - [registerScoped](#registerscoped)
  - [registerSingleton](#registersingleton)
  - [registerTopic](#registertopic)
  - [sendMessageToLocalEntityManagerWithoutRetries](#sendmessagetolocalentitymanagerwithoutretries)
  - [unregister](#unregister)

---

# context

## Tag

**Signature**

```ts
export declare const Tag: Tag<Sharding, Sharding>
```

Added in v1.0.0

# layers

## live

**Signature**

```ts
export declare const live: Layer<Storage | ShardingConfig | Pods | ShardManagerClient | Serialization, never, Sharding>
```

Added in v1.0.0

# models

## Sharding (interface)

**Signature**

```ts
export interface Sharding {
  /** @internal */
  readonly getShardId: (entityId: string) => ShardId.ShardId
  readonly register: Effect.Effect<never, never, void>
  readonly unregister: Effect.Effect<never, never, void>
  readonly messenger: <Msg>(
    entityType: RecipentType.EntityType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ) => Messenger<Msg>
  readonly broadcaster: <Msg>(
    topicType: RecipentType.TopicType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ) => Broadcaster<Msg>
  readonly isEntityOnLocalShards: (entityId: string) => Effect.Effect<never, never, boolean>
  readonly isShuttingDown: Effect.Effect<never, never, boolean>

  readonly registerScoped: Effect.Effect<Scope.Scope, never, void>
  readonly registerEntity: <Msg, R>(
    entityType: RecipentType.EntityType<Msg>,
    behaviour: RecipientBehaviour.RecipientBehaviour<R, Msg>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ) => Effect.Effect<Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void>
  readonly registerTopic: <Msg, R>(
    topicType: RecipentType.TopicType<Msg>,
    behaviour: RecipientBehaviour.RecipientBehaviour<R, Msg>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ) => Effect.Effect<Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void>
  readonly getShardingRegistrationEvents: Stream.Stream<
    never,
    never,
    ShardingRegistrationEvent.ShardingRegistrationEvent
  >
  readonly registerSingleton: <R>(name: string, run: Effect.Effect<R, never, void>) => Effect.Effect<R, never, void>
  /** @internal */
  readonly refreshAssignments: Effect.Effect<Scope.Scope, never, void>
  readonly assign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  readonly unassign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  readonly sendMessageToLocalEntityManagerWithoutRetries: (
    message: SerializedEnvelope.SerializedEnvelope
  ) => Effect.Effect<never, ShardingError.ShardingError, MessageState.MessageState<SerializedMessage.SerializedMessage>>
  readonly getPods: Effect.Effect<never, never, HashSet.HashSet<PodAddress.PodAddress>>
  readonly getAssignedShardIds: Effect.Effect<never, never, HashSet.HashSet<ShardId.ShardId>>
}
```

Added in v1.0.0

# utils

## broadcaster

Get an object that allows broadcasting messages to a given topic type.
You can provide a custom send timeout to override the one globally defined.

**Signature**

```ts
export declare const broadcaster: <Msg>(
  topicType: RecipentType.TopicType<Msg>,
  sendTimeout?: Option.Option<Duration.Duration> | undefined
) => Effect.Effect<Sharding, never, Broadcaster<Msg>>
```

Added in v1.0.0

## getAssignedShardIds

Gets the list of shardIds assigned to the current Pod

**Signature**

```ts
export declare const getAssignedShardIds: Effect.Effect<Sharding, never, HashSet.HashSet<ShardId.ShardId>>
```

Added in v1.0.0

## getPods

Get the list of pods currently registered to the Shard Manager

**Signature**

```ts
export declare const getPods: Effect.Effect<Sharding, never, HashSet.HashSet<PodAddress.PodAddress>>
```

Added in v1.0.0

## messenger

Get an object that allows sending messages to a given entity type.
You can provide a custom send timeout to override the one globally defined.

**Signature**

```ts
export declare const messenger: <Msg>(
  entityType: RecipentType.EntityType<Msg>,
  sendTimeout?: Option.Option<Duration.Duration> | undefined
) => Effect.Effect<Sharding, never, Messenger<Msg>>
```

Added in v1.0.0

## register

Notify the shard manager that shards can now be assigned to this pod.

**Signature**

```ts
export declare const register: Effect.Effect<Sharding, never, void>
```

Added in v1.0.0

## registerEntity

Register a new entity type, allowing pods to send messages to entities of this type.
It takes a `behavior` which is a function from an entity ID and a queue of messages to a ZIO computation that runs forever and consumes those messages.
You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the entity receives a message).
If entity goes to idle timeout, it will be interrupted from outside.

**Signature**

```ts
export declare const registerEntity: <Msg, R>(
  entityType: RecipentType.EntityType<Msg>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Msg>,
  options?: RecipientBehaviour.EntityBehaviourOptions | undefined
) => Effect.Effect<Sharding | Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void>
```

Added in v1.0.0

## registerScoped

Same as `register`, but will automatically call `unregister` when the `Scope` is terminated.

**Signature**

```ts
export declare const registerScoped: Effect.Effect<Sharding | Scope.Scope, never, void>
```

Added in v1.0.0

## registerSingleton

Start a computation that is guaranteed to run only on a single pod.
Each pod should call `registerSingleton` but only a single pod will actually run it at any given time.

**Signature**

```ts
export declare const registerSingleton: <R>(
  name: string,
  run: Effect.Effect<R, never, void>
) => Effect.Effect<Sharding | R, never, void>
```

Added in v1.0.0

## registerTopic

Register a new topic type, allowing pods to broadcast messages to subscribers.
It takes a `behavior` which is a function from a topic and a queue of messages to a ZIO computation that runs forever and consumes those messages.
You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the topic receives a message).
If entity goes to idle timeout, it will be interrupted from outside.

**Signature**

```ts
export declare const registerTopic: <Msg, R>(
  topicType: RecipentType.TopicType<Msg>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Msg>,
  options?: RecipientBehaviour.EntityBehaviourOptions | undefined
) => Effect.Effect<Sharding | Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void>
```

Added in v1.0.0

## sendMessageToLocalEntityManagerWithoutRetries

Sends a raw message to the local entity manager

**Signature**

```ts
export declare const sendMessageToLocalEntityManagerWithoutRetries: (
  message: SerializedEnvelope.SerializedEnvelope
) => Effect.Effect<
  Sharding,
  ShardingError.ShardingError,
  MessageState.MessageState<SerializedMessage.SerializedMessage>
>
```

Added in v1.0.0

## unregister

Notify the shard manager that shards must be unassigned from this pod.

**Signature**

```ts
export declare const unregister: Effect.Effect<Sharding, never, void>
```

Added in v1.0.0
