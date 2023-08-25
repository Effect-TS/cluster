---
title: ShardManagerClient.ts
nav_order: 41
parent: Modules
---

## ShardManagerClient overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [ShardManagerClient](#shardmanagerclient)
- [layers](#layers)
  - [local](#local)
- [models](#models)
  - [ShardManagerClient (interface)](#shardmanagerclient-interface)

---

# context

## ShardManagerClient

**Signature**

```ts
export declare const ShardManagerClient: Tag<ShardManagerClient, ShardManagerClient>
```

Added in v1.0.0

# layers

## local

**Signature**

```ts
export declare const local: Layer.Layer<unknown, unknown, ShardManagerClient>
```

Added in v1.0.0

# models

## ShardManagerClient (interface)

**Signature**

```ts
export interface ShardManagerClient {
  readonly register: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly unregister: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >
}
```

Added in v1.0.0
