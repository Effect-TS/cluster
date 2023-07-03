---
title: Pods.ts
nav_order: 12
parent: Modules
---

## Pods overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Pods](#pods)
- [layers](#layers)
  - [noop](#noop)
- [models](#models)
  - [Pods (interface)](#pods-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# context

## Pods

**Signature**

```ts
export declare const Pods: Tag<Pods, Pods>
```

Added in v1.0.0

# layers

## noop

A layer that creates a service that does nothing when called.
Useful for testing ShardManager or when using Sharding.local.

**Signature**

```ts
export declare const noop: Layer.Layer<never, never, Pods>
```

Added in v1.0.0

# models

## Pods (interface)

An interface to communicate with remote pods.
This is used by the Shard Manager for assigning and unassigning shards.
This is also used by pods for internal communication (forward messages to each other).

**Signature**

```ts
export interface Pods {
  [TypeId]: {}
  /**
   * Notify a pod that it was assigned a list of shards
   * @since 1.0.0
   */
  assignShards(pod: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>): Effect.Effect<never, never, void>

  /**
   * Notify a pod that it was unassigned a list of shards
   * @since 1.0.0
   */
  unassignShards(
    pod: PodAddress.PodAddress,
    shards: HashSet.HashSet<ShardId.ShardId>
  ): Effect.Effect<never, never, void>

  /**
   * Check that a pod is responsive
   * @since 1.0.0
   */
  ping(pod: PodAddress.PodAddress): Effect.Effect<never, PodUnavailable, void>

  /**
   * Send a message to a pod
   * @since 1.0.0
   */
  sendMessage(
    pod: PodAddress.PodAddress,
    message: BinaryMessage.BinaryMessage
  ): Effect.Effect<never, never, Option.Option<ByteArray.ByteArray>>
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: typeof TypeId
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
