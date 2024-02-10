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
export declare const live: Layer<Sharding, never, Storage | ShardingConfig | Pods | ShardManagerClient | Serialization>
```

Added in v1.0.0

# models

## Sharding (interface)

**Signature**

```ts
export interface Sharding {
  /** @internal */
  readonly getShardId: (entityId: string) => ShardId.ShardId
  readonly register: Effect.Effect<void>
  readonly unregister: Effect.Effect<void>
  readonly messenger: <Msg>(
    entityType: RecipentType.EntityType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ) => Messenger<Msg>
  readonly broadcaster: <Msg>(
    topicType: RecipentType.TopicType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ) => Broadcaster<Msg>
  readonly isEntityOnLocalShards: (entityId: string) => Effect.Effect<boolean>
  readonly isShuttingDown: Effect.Effect<boolean>

  readonly registerScoped: Effect.Effect<void, never, Scope.Scope>
  readonly registerEntity: <Msg>(
    entityType: RecipentType.EntityType<Msg>
  ) => <R>(
    behaviour: RecipientBehaviour.RecipientBehaviour<Msg, R>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ) => Effect.Effect<void, never, Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>>
  readonly registerTopic: <Msg>(
    topicType: RecipentType.TopicType<Msg>
  ) => <R>(
    behaviour: RecipientBehaviour.RecipientBehaviour<Msg, R>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ) => Effect.Effect<void, never, Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>>
  readonly getShardingRegistrationEvents: Stream.Stream<ShardingRegistrationEvent.ShardingRegistrationEvent>
  readonly registerSingleton: <R>(name: string, run: Effect.Effect<void, never, R>) => Effect.Effect<void, never, R>
  /** @internal */
  readonly refreshAssignments: Effect.Effect<void, never, Scope.Scope>
  readonly assign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<void>
  readonly unassign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<void>
  readonly sendMessageToLocalEntityManagerWithoutRetries: (
    message: SerializedEnvelope.SerializedEnvelope
  ) => Effect.Effect<MessageState.MessageState<SerializedMessage.SerializedMessage>, ShardingError.ShardingError>
  readonly getPods: Effect.Effect<HashSet.HashSet<PodAddress.PodAddress>>
  readonly getAssignedShardIds: Effect.Effect<HashSet.HashSet<ShardId.ShardId>>
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
) => Effect.Effect<Broadcaster<Msg>, never, Sharding>
```

Added in v1.0.0

## getAssignedShardIds

Gets the list of shardIds assigned to the current Pod

**Signature**

```ts
export declare const getAssignedShardIds: Effect.Effect<HashSet.HashSet<ShardId.ShardId>, never, Sharding>
```

Added in v1.0.0

## getPods

Get the list of pods currently registered to the Shard Manager

**Signature**

```ts
export declare const getPods: Effect.Effect<HashSet.HashSet<PodAddress.PodAddress>, never, Sharding>
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
) => Effect.Effect<Messenger<Msg>, never, Sharding>
```

Added in v1.0.0

## register

Notify the shard manager that shards can now be assigned to this pod.

**Signature**

```ts
export declare const register: Effect.Effect<void, never, Sharding>
```

Added in v1.0.0

## registerEntity

Register a new entity type, allowing pods to send messages to entities of this type.
It takes a `behavior` which is a function from an entity ID and a queue of messages to a ZIO computation that runs forever and consumes those messages.
You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the entity receives a message).
If entity goes to idle timeout, it will be interrupted from outside.

**Signature**

```ts
export declare const registerEntity: <Msg>(
  entityType: RecipentType.EntityType<Msg>
) => <R>(
  behavior: RecipientBehaviour.RecipientBehaviour<Msg, R>,
  options?: RecipientBehaviour.EntityBehaviourOptions | undefined
) => Effect.Effect<void, never, Sharding | Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>>
```

Added in v1.0.0

## registerScoped

Same as `register`, but will automatically call `unregister` when the `Scope` is terminated.

**Signature**

```ts
export declare const registerScoped: Effect.Effect<void, never, Sharding | Scope.Scope>
```

Added in v1.0.0

## registerSingleton

Start a computation that is guaranteed to run only on a single pod.
Each pod should call `registerSingleton` but only a single pod will actually run it at any given time.

**Signature**

```ts
export declare const registerSingleton: <R>(
  name: string,
  run: Effect.Effect<void, never, R>
) => Effect.Effect<void, never, Sharding | R>
```

Added in v1.0.0

## registerTopic

Register a new topic type, allowing pods to broadcast messages to subscribers.
It takes a `behavior` which is a function from a topic and a queue of messages to a ZIO computation that runs forever and consumes those messages.
You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the topic receives a message).
If entity goes to idle timeout, it will be interrupted from outside.

**Signature**

```ts
export declare const registerTopic: <Msg>(
  topicType: RecipentType.TopicType<Msg>
) => <R>(
  behavior: RecipientBehaviour.RecipientBehaviour<Msg, R>,
  options?: RecipientBehaviour.EntityBehaviourOptions | undefined
) => Effect.Effect<void, never, Sharding | Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>>
```

Added in v1.0.0

## sendMessageToLocalEntityManagerWithoutRetries

Sends a raw message to the local entity manager

**Signature**

```ts
export declare const sendMessageToLocalEntityManagerWithoutRetries: (
  message: SerializedEnvelope.SerializedEnvelope
) => Effect.Effect<
  MessageState.MessageState<SerializedMessage.SerializedMessage>,
  ShardingError.ShardingError,
  Sharding
>
```

Added in v1.0.0

## unregister

Notify the shard manager that shards must be unassigned from this pod.

**Signature**

```ts
export declare const unregister: Effect.Effect<void, never, Sharding>
```

Added in v1.0.0
