---
title: ShardingErrorEntityTypeNotRegistered.ts
nav_order: 25
parent: "@effect/cluster"
---

## ShardingErrorEntityTypeNotRegistered overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorEntityTypeNotRegistered](#shardingerrorentitytypenotregistered)
  - [isShardingErrorEntityTypeNotRegistered](#isshardingerrorentitytypenotregistered)
- [models](#models)
  - [ShardingErrorEntityTypeNotRegistered (interface)](#shardingerrorentitytypenotregistered-interface)
- [schema](#schema)
  - [ShardingErrorEntityTypeNotRegisteredSchema](#shardingerrorentitytypenotregisteredschema)
- [symbols](#symbols)
  - [ShardingErrorEntityTypeNotRegisteredTag](#shardingerrorentitytypenotregisteredtag)

---

# constructors

## ShardingErrorEntityTypeNotRegistered

**Signature**

```ts
export declare function ShardingErrorEntityTypeNotRegistered(
  entityType: string,
  podAddress: PodAddress.PodAddress
): ShardingErrorEntityTypeNotRegistered
```

Added in v1.0.0

## isShardingErrorEntityTypeNotRegistered

**Signature**

```ts
export declare function isShardingErrorEntityTypeNotRegistered(
  value: unknown
): value is ShardingErrorEntityTypeNotRegistered
```

Added in v1.0.0

# models

## ShardingErrorEntityTypeNotRegistered (interface)

**Signature**

```ts
export interface ShardingErrorEntityTypeNotRegistered
  extends Schema.Schema.To<typeof ShardingErrorEntityTypeNotRegisteredSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorEntityTypeNotRegisteredSchema

**Signature**

```ts
export declare const ShardingErrorEntityTypeNotRegisteredSchema: Schema.Schema<
  ShardingErrorEntityTypeNotRegistered,
  {
    readonly _tag: "./ShardingErrorEntityTypeNotRegistered"
    readonly podAddress: PodAddress.PodAddress.From
    readonly entityType: string
  },
  never
>
```

Added in v1.0.0

# symbols

## ShardingErrorEntityTypeNotRegisteredTag

**Signature**

```ts
export declare const ShardingErrorEntityTypeNotRegisteredTag: "./ShardingErrorEntityTypeNotRegistered"
```

Added in v1.0.0
