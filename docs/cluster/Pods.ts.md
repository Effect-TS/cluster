---
title: Pods.ts
nav_order: 8
parent: "@effect/cluster"
---

## Pods overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Pods](#pods)
  - [make](#make)
- [layers](#layers)
  - [noop](#noop)
- [models](#models)
  - [Pods (interface)](#pods-interface)
- [symbols](#symbols)
  - [PodsTypeId](#podstypeid)
  - [PodsTypeId (type alias)](#podstypeid-type-alias)

---

# context

## Pods

**Signature**

```ts
export declare const Pods: Context.Tag<Pods, Pods>
```

Added in v1.0.0

## make

**Signature**

```ts
export declare const make: (args: Omit<Pods, typeof PodsTypeId>) => Pods
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
  /**
   * @since 1.0.0
   */
  readonly [PodsTypeId]: PodsTypeId

  /**
   * Notify a pod that it was assigned a list of shards
   * @since 1.0.0
   */
  readonly assignShards: (
    pod: PodAddress.PodAddress,
    shards: HashSet.HashSet<ShardId.ShardId>
  ) => Effect.Effect<never, never, void>

  /**
   * Notify a pod that it was unassigned a list of shards
   * @since 1.0.0
   */
  readonly unassignShards: (
    pod: PodAddress.PodAddress,
    shards: HashSet.HashSet<ShardId.ShardId>
  ) => Effect.Effect<never, never, void>

  /**
   * Check that a pod is responsive
   * @since 1.0.0
   */
  readonly ping: (pod: PodAddress.PodAddress) => Effect.Effect<never, ShardingError.ShardingErrorPodUnavailable, void>

  /**
   * Send a message to a pod and receive a reply
   * @since 1.0.0
   */
  readonly sendMessage: (
    pod: PodAddress.PodAddress,
    envelope: SerializedEnvelope.SerializedEnvelope
  ) => Effect.Effect<never, ShardingError.ShardingError, Option.Option<SerializedMessage.SerializedMessage>>
}
```

Added in v1.0.0

# symbols

## PodsTypeId

**Signature**

```ts
export declare const PodsTypeId: typeof PodsTypeId
```

Added in v1.0.0

## PodsTypeId (type alias)

**Signature**

```ts
export type PodsTypeId = typeof PodsTypeId
```

Added in v1.0.0
