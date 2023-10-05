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
  - [SendStreamResultItem\_](#sendstreamresultitem_)
  - [SendStream\_](#sendstream_)
  - [Send\_](#send_)
  - [UnassignShards\_](#unassignshards_)
  - [schema](#schema-1)

---

# schema

## AssignShard\_

**Signature**

```ts
export declare const AssignShard_: Schema.Schema<
  { readonly shards: readonly { readonly _id: '@effect/cluster/ShardId'; readonly value: number }[] },
  { readonly shards: readonly Data<{ readonly _id: '@effect/cluster/ShardId'; readonly value: number }>[] }
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
  | {
      readonly _tag: 'Left'
      readonly left:
        | { readonly _tag: '@effect/cluster/ShardingErrorSerialization'; readonly error: string }
        | { readonly _tag: '@effect/cluster/ShardingErrorEntityNotManagedByThisPod'; readonly entityId: string }
        | {
            readonly _tag: '@effect/cluster/ShardingErrorEntityTypeNotRegistered'
            readonly entityType: string
            readonly podAddress: {
              readonly _id: '@effect/cluster/PodAddress'
              readonly host: string
              readonly port: number
            }
          }
        | { readonly _tag: '@effect/cluster/ShardingErrorMessageQueue'; readonly error: string }
        | {
            readonly _tag: '@effect/cluster/ShardingErrorPodNoLongerRegistered'
            readonly podAddress: {
              readonly _id: '@effect/cluster/PodAddress'
              readonly host: string
              readonly port: number
            }
          }
        | {
            readonly _tag: '@effect/cluster/ShardingErrorPodUnavailable'
            readonly pod: { readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }
          }
        | { readonly _tag: '@effect/cluster/ShardingErrorSendTimeout' }
    }
  | {
      readonly _tag: 'Right'
      readonly right:
        | { readonly _tag: 'None' }
        | {
            readonly _tag: 'Some'
            readonly value: { readonly _id: '@effect/cluster/ByteArray'; readonly value: string }
          }
    },
  Either<
    | ShardingError.ShardingErrorSerialization
    | ShardingError.ShardingErrorEntityNotManagedByThisPod
    | ShardingError.ShardingErrorEntityTypeNotRegistered
    | ShardingError.ShardingErrorMessageQueue
    | ShardingError.ShardingErrorPodNoLongerRegistered
    | ShardingError.ShardingErrorPodUnavailable
    | ShardingError.ShardingErrorSendTimeout,
    Option<Data<{ readonly _id: '@effect/cluster/ByteArray'; readonly value: string }>>
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
      readonly left:
        | { readonly _tag: '@effect/cluster/ShardingErrorSerialization'; readonly error: string }
        | { readonly _tag: '@effect/cluster/ShardingErrorEntityNotManagedByThisPod'; readonly entityId: string }
        | {
            readonly _tag: '@effect/cluster/ShardingErrorEntityTypeNotRegistered'
            readonly entityType: string
            readonly podAddress: {
              readonly _id: '@effect/cluster/PodAddress'
              readonly host: string
              readonly port: number
            }
          }
        | { readonly _tag: '@effect/cluster/ShardingErrorMessageQueue'; readonly error: string }
        | {
            readonly _tag: '@effect/cluster/ShardingErrorPodNoLongerRegistered'
            readonly podAddress: {
              readonly _id: '@effect/cluster/PodAddress'
              readonly host: string
              readonly port: number
            }
          }
        | {
            readonly _tag: '@effect/cluster/ShardingErrorPodUnavailable'
            readonly pod: { readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }
          }
        | { readonly _tag: '@effect/cluster/ShardingErrorSendTimeout' }
    }
  | { readonly _tag: 'Right'; readonly right: { readonly _id: '@effect/cluster/ByteArray'; readonly value: string } },
  Either<
    | ShardingError.ShardingErrorSerialization
    | ShardingError.ShardingErrorEntityNotManagedByThisPod
    | ShardingError.ShardingErrorEntityTypeNotRegistered
    | ShardingError.ShardingErrorMessageQueue
    | ShardingError.ShardingErrorPodNoLongerRegistered
    | ShardingError.ShardingErrorPodUnavailable
    | ShardingError.ShardingErrorSendTimeout,
    Data<{ readonly _id: '@effect/cluster/ByteArray'; readonly value: string }>
  >
>
```

Added in v1.0.0

## SendStream\_

**Signature**

```ts
export declare const SendStream_: Schema.Schema<
  {
    readonly message: {
      readonly _id: '@effect/cluster/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: { readonly _id: '@effect/cluster/ByteArray'; readonly value: string }
      readonly replyId:
        | { readonly _tag: 'None' }
        | {
            readonly _tag: 'Some'
            readonly value: { readonly _id: '@effect/cluster/ReplyId'; readonly value: string }
          }
    }
  },
  {
    readonly message: Data<{
      readonly _id: '@effect/cluster/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: Data<{ readonly _id: '@effect/cluster/ByteArray'; readonly value: string }>
      readonly replyId: Option<Data<{ readonly _id: '@effect/cluster/ReplyId'; readonly value: string }>>
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
    readonly message: {
      readonly _id: '@effect/cluster/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: { readonly _id: '@effect/cluster/ByteArray'; readonly value: string }
      readonly replyId:
        | { readonly _tag: 'None' }
        | {
            readonly _tag: 'Some'
            readonly value: { readonly _id: '@effect/cluster/ReplyId'; readonly value: string }
          }
    }
  },
  {
    readonly message: Data<{
      readonly _id: '@effect/cluster/BinaryMessage'
      readonly entityId: string
      readonly entityType: string
      readonly body: Data<{ readonly _id: '@effect/cluster/ByteArray'; readonly value: string }>
      readonly replyId: Option<Data<{ readonly _id: '@effect/cluster/ReplyId'; readonly value: string }>>
    }>
  }
>
```

Added in v1.0.0

## UnassignShards\_

**Signature**

```ts
export declare const UnassignShards_: Schema.Schema<
  { readonly shards: readonly { readonly _id: '@effect/cluster/ShardId'; readonly value: number }[] },
  { readonly shards: readonly Data<{ readonly _id: '@effect/cluster/ShardId'; readonly value: number }>[] }
>
```

Added in v1.0.0

## schema

This is the schema for the protocol.

**Signature**

```ts
export declare const schema: Schema.Schema<
  | { readonly shards: readonly { readonly _id: '@effect/cluster/ShardId'; readonly value: number }[] }
  | { readonly shards: readonly { readonly _id: '@effect/cluster/ShardId'; readonly value: number }[] }
  | {
      readonly message: {
        readonly _id: '@effect/cluster/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: { readonly _id: '@effect/cluster/ByteArray'; readonly value: string }
        readonly replyId:
          | { readonly _tag: 'None' }
          | {
              readonly _tag: 'Some'
              readonly value: { readonly _id: '@effect/cluster/ReplyId'; readonly value: string }
            }
      }
    }
  | {
      readonly message: {
        readonly _id: '@effect/cluster/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: { readonly _id: '@effect/cluster/ByteArray'; readonly value: string }
        readonly replyId:
          | { readonly _tag: 'None' }
          | {
              readonly _tag: 'Some'
              readonly value: { readonly _id: '@effect/cluster/ReplyId'; readonly value: string }
            }
      }
    }
  | {},
  | { readonly shards: readonly Data<{ readonly _id: '@effect/cluster/ShardId'; readonly value: number }>[] }
  | { readonly shards: readonly Data<{ readonly _id: '@effect/cluster/ShardId'; readonly value: number }>[] }
  | {
      readonly message: Data<{
        readonly _id: '@effect/cluster/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: Data<{ readonly _id: '@effect/cluster/ByteArray'; readonly value: string }>
        readonly replyId: Option<Data<{ readonly _id: '@effect/cluster/ReplyId'; readonly value: string }>>
      }>
    }
  | {
      readonly message: Data<{
        readonly _id: '@effect/cluster/BinaryMessage'
        readonly entityId: string
        readonly entityType: string
        readonly body: Data<{ readonly _id: '@effect/cluster/ByteArray'; readonly value: string }>
        readonly replyId: Option<Data<{ readonly _id: '@effect/cluster/ReplyId'; readonly value: string }>>
      }>
    }
  | {}
>
```

Added in v1.0.0
