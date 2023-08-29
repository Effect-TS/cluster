---
title: ShardingErrorPodNoLongerRegistered.ts
nav_order: 29
parent: "@effect/sharding"
---

## ShardingErrorPodNoLongerRegistered overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorPodNoLongerRegistered](#shardingerrorpodnolongerregistered)
  - [isShardingErrorPodNoLongerRegistered](#isshardingerrorpodnolongerregistered)
- [models](#models)
  - [ShardingErrorPodNoLongerRegistered (interface)](#shardingerrorpodnolongerregistered-interface)
- [schema](#schema)
  - [ShardingErrorPodNoLongerRegisteredSchema](#shardingerrorpodnolongerregisteredschema)
- [symbols](#symbols)
  - [ShardingErrorPodNoLongerRegisteredTag](#shardingerrorpodnolongerregisteredtag)

---

# constructors

## ShardingErrorPodNoLongerRegistered

**Signature**

```ts
export declare function ShardingErrorPodNoLongerRegistered(
  podAddress: PodAddress.PodAddress
): ShardingErrorPodNoLongerRegistered
```

Added in v1.0.0

## isShardingErrorPodNoLongerRegistered

**Signature**

```ts
export declare function isShardingErrorPodNoLongerRegistered(
  value: unknown
): value is ShardingErrorPodNoLongerRegistered
```

Added in v1.0.0

# models

## ShardingErrorPodNoLongerRegistered (interface)

**Signature**

```ts
export interface ShardingErrorPodNoLongerRegistered
  extends Schema.To<typeof ShardingErrorPodNoLongerRegisteredSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorPodNoLongerRegisteredSchema

**Signature**

```ts
export declare const ShardingErrorPodNoLongerRegisteredSchema: Schema.Schema<
  {
    readonly _tag: '@effect/sharding/ShardingErrorPodNoLongerRegistered'
    readonly podAddress: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
  },
  ShardingErrorPodNoLongerRegistered
>
```

Added in v1.0.0

# symbols

## ShardingErrorPodNoLongerRegisteredTag

**Signature**

```ts
export declare const ShardingErrorPodNoLongerRegisteredTag: '@effect/sharding/ShardingErrorPodNoLongerRegistered'
```

Added in v1.0.0
