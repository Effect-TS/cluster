---
title: ShardingErrorPodNoLongerRegistered.ts
nav_order: 27
parent: "@effect/cluster"
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
  extends Schema.Schema.To<typeof ShardingErrorPodNoLongerRegisteredSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorPodNoLongerRegisteredSchema

**Signature**

```ts
export declare const ShardingErrorPodNoLongerRegisteredSchema: Schema.Schema<
  {
    readonly _tag: "./ShardingErrorPodNoLongerRegistered"
    readonly podAddress: {
      readonly "@effect/cluster/PodAddress": "@effect/cluster/PodAddress"
      readonly host: string
      readonly port: number
    }
  },
  ShardingErrorPodNoLongerRegistered
>
```

Added in v1.0.0

# symbols

## ShardingErrorPodNoLongerRegisteredTag

**Signature**

```ts
export declare const ShardingErrorPodNoLongerRegisteredTag: "./ShardingErrorPodNoLongerRegistered"
```

Added in v1.0.0
