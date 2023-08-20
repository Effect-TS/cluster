---
title: ShardingProtocolHttp.ts
nav_order: 30
parent: Modules
---

## ShardingProtocolHttp overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [schema](#schema)
  - [AssignShardResult\_](#assignshardresult_)
  - [AssignShard\_](#assignshard_)
  - [PingShardsResult\_](#pingshardsresult_)
  - [PingShards\_](#pingshards_)
  - [SendResult\_](#sendresult_)
  - [SendStreamResultItem\_](#sendstreamresultitem_)
  - [SendStream\_](#sendstream_)
  - [Send\_](#send_)
  - [UnassignShardsResult\_](#unassignshardsresult_)
  - [UnassignShards\_](#unassignshards_)
  - [schema](#schema-1)

---

# schema

## AssignShardResult\_

**Signature**

```ts
export declare const AssignShardResult_: Schema.Schema<
  { readonly _tag: 'Left'; readonly left: never } | { readonly _tag: 'Right'; readonly right: boolean },
  Either<never, boolean>
>
```

Added in v1.0.0

## AssignShard\_

**Signature**

```ts
export declare const AssignShard_: Schema.Schema<
  {
    readonly _tag: 'AssignShards'
    readonly shards: readonly { readonly _id: '@effect/shardcake/ShardId'; readonly value: number }[]
  },
  {
    readonly _tag: 'AssignShards'
    readonly shards: readonly Data<{ readonly _id: '@effect/shardcake/ShardId'; readonly value: number }>[]
  }
>
```

Added in v1.0.0

## PingShardsResult\_

**Signature**

```ts
export declare const PingShardsResult_: Schema.Schema<
  { readonly _tag: 'Left'; readonly left: never } | { readonly _tag: 'Right'; readonly right: boolean },
  Either<never, boolean>
>
```

Added in v1.0.0

## PingShards\_

**Signature**

```ts
export declare const PingShards_: Schema.Schema<{ readonly _tag: 'PingShards' }, { readonly _tag: 'PingShards' }>
```

Added in v1.0.0

## SendResult\_

**Signature**

```ts
export declare const SendResult_: Schema.Schema<
  | {
      readonly _tag: 'Left'
      readonly left: {
        readonly entityType: string
        readonly _tag: 'EntityTypeNotRegistered'
        readonly podAddress: {
          readonly _id: '@effect/shardcake/PodAddress'
          readonly host: string
          readonly port: number
        }
      }
    }
  | {
      readonly _tag: 'Right'
      readonly right:
        | { readonly _tag: 'None' }
        | {
            readonly _tag: 'Some'
            readonly value: { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }
          }
    },
  Either<
    {
      readonly entityType: string
      readonly _tag: 'EntityTypeNotRegistered'
      readonly podAddress: Data<{
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }>
    },
    Option<Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>>
  >
>
```

Added in v1.0.0

## SendStreamResultItem\_

**Signature**

```ts
export declare const SendStreamResultItem_: Schema.Schema<
  | {
      readonly _tag: 'Left'
      readonly left: {
        readonly entityType: string
        readonly _tag: 'EntityTypeNotRegistered'
        readonly podAddress: {
          readonly _id: '@effect/shardcake/PodAddress'
          readonly host: string
          readonly port: number
        }
      }
    }
  | { readonly _tag: 'Right'; readonly right: { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string } },
  Either<
    {
      readonly entityType: string
      readonly _tag: 'EntityTypeNotRegistered'
      readonly podAddress: Data<{
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }>
    },
    Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>
  >
>
```

Added in v1.0.0

## SendStream\_

**Signature**

```ts
export declare const SendStream_: Schema.Schema<
  {
    readonly _tag: 'SendStream'
    readonly message: {
      readonly _id: '@effect/shardcake/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }
      readonly replyId:
        | { readonly _tag: 'None' }
        | {
            readonly _tag: 'Some'
            readonly value: { readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }
          }
    }
  },
  {
    readonly _tag: 'SendStream'
    readonly message: Data<{
      readonly _id: '@effect/shardcake/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>
      readonly replyId: Option<Data<{ readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }>>
    }>
  }
>
```

Added in v1.0.0

## Send\_

**Signature**

```ts
export declare const Send_: Schema.Schema<
  {
    readonly _tag: 'Send'
    readonly message: {
      readonly _id: '@effect/shardcake/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }
      readonly replyId:
        | { readonly _tag: 'None' }
        | {
            readonly _tag: 'Some'
            readonly value: { readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }
          }
    }
  },
  {
    readonly _tag: 'Send'
    readonly message: Data<{
      readonly _id: '@effect/shardcake/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>
      readonly replyId: Option<Data<{ readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }>>
    }>
  }
>
```

Added in v1.0.0

## UnassignShardsResult\_

**Signature**

```ts
export declare const UnassignShardsResult_: Schema.Schema<
  { readonly _tag: 'Left'; readonly left: never } | { readonly _tag: 'Right'; readonly right: boolean },
  Either<never, boolean>
>
```

Added in v1.0.0

## UnassignShards\_

**Signature**

```ts
export declare const UnassignShards_: Schema.Schema<
  {
    readonly _tag: 'UnassignShards'
    readonly shards: readonly { readonly _id: '@effect/shardcake/ShardId'; readonly value: number }[]
  },
  {
    readonly _tag: 'UnassignShards'
    readonly shards: readonly Data<{ readonly _id: '@effect/shardcake/ShardId'; readonly value: number }>[]
  }
>
```

Added in v1.0.0

## schema

This is the schema for the protocol.

**Signature**

```ts
export declare const schema: Schema.Schema<
  | {
      readonly _tag: 'AssignShards'
      readonly shards: readonly { readonly _id: '@effect/shardcake/ShardId'; readonly value: number }[]
    }
  | {
      readonly _tag: 'UnassignShards'
      readonly shards: readonly { readonly _id: '@effect/shardcake/ShardId'; readonly value: number }[]
    }
  | { readonly _tag: 'PingShards' }
  | {
      readonly _tag: 'Send'
      readonly message: {
        readonly _id: '@effect/shardcake/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }
        readonly replyId:
          | { readonly _tag: 'None' }
          | {
              readonly _tag: 'Some'
              readonly value: { readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }
            }
      }
    }
  | {
      readonly _tag: 'SendStream'
      readonly message: {
        readonly _id: '@effect/shardcake/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }
        readonly replyId:
          | { readonly _tag: 'None' }
          | {
              readonly _tag: 'Some'
              readonly value: { readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }
            }
      }
    },
  | {
      readonly _tag: 'AssignShards'
      readonly shards: readonly Data<{ readonly _id: '@effect/shardcake/ShardId'; readonly value: number }>[]
    }
  | {
      readonly _tag: 'UnassignShards'
      readonly shards: readonly Data<{ readonly _id: '@effect/shardcake/ShardId'; readonly value: number }>[]
    }
  | { readonly _tag: 'PingShards' }
  | {
      readonly _tag: 'Send'
      readonly message: Data<{
        readonly _id: '@effect/shardcake/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>
        readonly replyId: Option<Data<{ readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }>>
      }>
    }
  | {
      readonly _tag: 'SendStream'
      readonly message: Data<{
        readonly _id: '@effect/shardcake/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>
        readonly replyId: Option<Data<{ readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }>>
      }>
    }
>
```

Added in v1.0.0
