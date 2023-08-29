---
title: ShardingError.ts
nav_order: 25
parent: "@effect/sharding"
---

## ShardingError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [ShardingError (type alias)](#shardingerror-type-alias)
- [schema](#schema)
  - [schema](#schema-1)

---

# models

## ShardingError (type alias)

**Signature**

```ts
export type ShardingError = Schema.To<typeof schema>
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: Schema.Schema<
  | { readonly error: string; readonly _tag: '@effect/sharding/ShardingErrorSerialization' }
  | { readonly _tag: '@effect/sharding/ShardingErrorSendTimeout' }
  | {
      readonly _tag: '@effect/sharding/ShardingErrorPodUnavailable'
      readonly pod: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
    }
  | {
      readonly _tag: '@effect/sharding/ShardingErrorPodNoLongerRegistered'
      readonly podAddress: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
    }
  | { readonly error: string; readonly _tag: '@effect/sharding/ShardingErrorMessageQueue' }
  | {
      readonly _tag: '@effect/sharding/ShardingErrorEntityTypeNotRegistered'
      readonly podAddress: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
      readonly entityType: string
    }
  | { readonly _tag: '@effect/sharding/ShardingErrorEntityNotManagedByThisPod'; readonly entityId: string },
  | ShardingErrorSerialization
  | ShardingErrorSendTimeout
  | ShardingErrorPodUnavailable
  | ShardingErrorPodNoLongerRegistered
  | ShardingErrorMessageQueue
  | ShardingErrorEntityTypeNotRegistered
  | ShardingErrorEntityNotManagedByThisPod
>
```

Added in v1.0.0
