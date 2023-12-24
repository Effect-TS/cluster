---
title: ShardManagerClient.ts
nav_order: 36
parent: "@effect/cluster"
---

## ShardManagerClient overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [context](#context)
  - [ShardManagerClient](#shardmanagerclient)
- [layers](#layers)
  - [local](#local)
- [models](#models)
  - [ShardManagerClient (interface)](#shardmanagerclient-interface)
  - [ShardManagerClientTypeId (type alias)](#shardmanagerclienttypeid-type-alias)
- [symbols](#symbols)
  - [ShardManagerClientTypeId](#shardmanagerclienttypeid)

---

# constructors

## make

**Signature**

```ts
export declare const make: (args: Omit<ShardManagerClient, typeof ShardManagerClientTypeId>) => ShardManagerClient
```

Added in v1.0.0

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
export declare const local: Layer.Layer<ShardingConfig.ShardingConfig, never, ShardManagerClient>
```

Added in v1.0.0

# models

## ShardManagerClient (interface)

**Signature**

```ts
export interface ShardManagerClient {
  readonly [ShardManagerClientTypeId]: ShardManagerClientTypeId
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

## ShardManagerClientTypeId (type alias)

**Signature**

```ts
export type ShardManagerClientTypeId = typeof ShardManagerClientTypeId
```

Added in v1.0.0

# symbols

## ShardManagerClientTypeId

**Signature**

```ts
export declare const ShardManagerClientTypeId: typeof ShardManagerClientTypeId
```

Added in v1.0.0
