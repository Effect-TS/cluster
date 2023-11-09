---
title: ShardingProtocolHttp.ts
nav_order: 4
parent: "@effect/cluster-node"
---

## ShardingProtocolHttp overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [schema](#schema)
  - [AssignShard\_](#assignshard_)
  - [PingShards\_](#pingshards_)
  - [SendResult\_](#sendresult_)
  - [Send\_](#send_)
  - [UnassignShards\_](#unassignshards_)
  - [schema](#schema-1)

---

# schema

## AssignShard\_

**Signature**

```ts
export declare const AssignShard_: Schema.Schema<
  { readonly shards: readonly unknown[] },
  { readonly shards: readonly unknown[] }
>
```

Added in v1.0.0

## PingShards\_

**Signature**

```ts
export declare const PingShards_: Schema.Schema<{}, {}>
```

Added in v1.0.0

## SendResult\_

**Signature**

```ts
export declare const SendResult_: Schema.Schema<
  | { readonly _tag: "Left"; readonly left: unknown }
  | {
      readonly _tag: "Right"
      readonly right: { readonly _tag: "None" } | { readonly _tag: "Some"; readonly value: unknown }
    },
  Either<unknown, Option<unknown>>
>
```

Added in v1.0.0

## Send\_

**Signature**

```ts
export declare const Send_: Schema.Schema<{ [x: string]: any }, { [x: string]: any }>
```

Added in v1.0.0

## UnassignShards\_

**Signature**

```ts
export declare const UnassignShards_: Schema.Schema<
  { readonly shards: readonly unknown[] },
  { readonly shards: readonly unknown[] }
>
```

Added in v1.0.0

## schema

This is the schema for the protocol.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly shards: readonly unknown[] } | { readonly shards: readonly unknown[] } | { [x: string]: any } | {},
  { readonly shards: readonly unknown[] } | { readonly shards: readonly unknown[] } | { [x: string]: any } | {}
>
```

Added in v1.0.0
