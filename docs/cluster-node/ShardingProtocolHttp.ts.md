---
title: ShardingProtocolHttp.ts
nav_order: 3
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
  { readonly shards: ReadonlyArray<ShardId.ShardId> },
  {
    readonly shards: ReadonlyArray<{
      readonly "@effect/cluster/ShardId": "@effect/cluster/ShardId"
      readonly value: number
    }>
  },
  never
>
```

Added in v1.0.0

## PingShards\_

**Signature**

```ts
export declare const PingShards_: Schema.Schema<{}, {}, never>
```

Added in v1.0.0

## SendResult\_

**Signature**

```ts
export declare const SendResult_: Schema.Schema<Either<unknown, unknown>, Schema.EitherFrom<unknown, unknown>, unknown>
```

Added in v1.0.0

## Send\_

**Signature**

```ts
export declare const Send_: Schema.Schema<
  { readonly message: SerializedEnvelope.SerializedEnvelope },
  { readonly message: SerializedEnvelope.SerializedEnvelope.From },
  never
>
```

Added in v1.0.0

## UnassignShards\_

**Signature**

```ts
export declare const UnassignShards_: Schema.Schema<
  { readonly shards: ReadonlyArray<ShardId.ShardId> },
  { readonly shards: ReadonlyArray<ShardId.ShardId.From> },
  never
>
```

Added in v1.0.0

## schema

This is the schema for the protocol.

**Signature**

```ts
export declare const schema: Schema.Schema<
  | { readonly shards: readonly ShardId.ShardId[] }
  | { readonly shards: readonly ShardId.ShardId[] }
  | { readonly message: SerializedEnvelope.SerializedEnvelope }
  | {},
  | {
      readonly shards: readonly {
        readonly "@effect/cluster/ShardId": "@effect/cluster/ShardId"
        readonly value: number
      }[]
    }
  | { readonly shards: readonly ShardId.ShardId.From[] }
  | { readonly message: SerializedEnvelope.SerializedEnvelope.From }
  | {},
  never
>
```

Added in v1.0.0
