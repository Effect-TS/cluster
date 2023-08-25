---
title: ShardingError/index.ts
nav_order: 27
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [ShardingError (type alias)](#shardingerror-type-alias)
- [schema](#schema)
  - [ShardingErrorSchema](#shardingerrorschema)

---

# models

## ShardingError (type alias)

**Signature**

```ts
export type ShardingError = Schema.To<typeof ShardingErrorSchema>
```

Added in v1.0.0

# schema

## ShardingErrorSchema

**Signature**

```ts
export declare const ShardingErrorSchema: Schema.Schema<
  | {
      readonly _tag: '@effect/shardcake/ShardingPodUnavailableError'
      readonly pod: { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }
    }
  | {
      readonly entityType: string
      readonly _tag: '@effect/shardcake/ShardingEntityTypeNotRegisteredError'
      readonly podAddress: {
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }
    }
  | { readonly _tag: '@effect/shardcake/ShardingSerializationError'; readonly error: string }
  | { readonly entityId: string; readonly _tag: '@effect/shardcake/ShardingEntityNotManagedByThisPodError' }
  | { readonly _tag: '@effect/shardcake/ShardingMessageQueueError'; readonly error: string }
  | {
      readonly _tag: '@effect/shardcake/ShardingPodNoLongerRegisteredError'
      readonly podAddress: {
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }
    }
  | { readonly _tag: '@effect/shardcake/ShardingSendTimeoutError' },
  | ShardingPodUnavailableError
  | ShardingEntityTypeNotRegisteredError
  | ShardingSerializationError
  | ShardingEntityNotManagedByThisPodError
  | ShardingMessageQueueError
  | ShardingPodNoLongerRegisteredError
  | ShardingSendTimeoutError
>
```

Added in v1.0.0
