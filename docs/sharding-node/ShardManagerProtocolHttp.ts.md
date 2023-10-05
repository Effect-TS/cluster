---
title: ShardManagerProtocolHttp.ts
nav_order: 7
parent: "@effect/cluster-node"
---

## ShardManagerProtocolHttp overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [schema](#schema)
  - [GetAssignmentsResult\_](#getassignmentsresult_)
  - [NotifyUnhealthyPod\_](#notifyunhealthypod_)
  - [Register\_](#register_)
  - [Unregister\_](#unregister_)

---

# schema

## GetAssignmentsResult\_

**Signature**

```ts
export declare const GetAssignmentsResult_: Schema.Schema<
  readonly (readonly [
    { readonly _id: '@effect/cluster/ShardId'; readonly value: number },
    (
      | { readonly _tag: 'None' }
      | {
          readonly _tag: 'Some'
          readonly value: { readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }
        }
    )
  ])[],
  readonly (readonly [
    Data<{ readonly _id: '@effect/cluster/ShardId'; readonly value: number }>,
    Option<Data<{ readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }>>
  ])[]
>
```

Added in v1.0.0

## NotifyUnhealthyPod\_

**Signature**

```ts
export declare const NotifyUnhealthyPod_: Schema.Schema<
  {
    readonly podAddress: { readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }
  },
  {
    readonly podAddress: Data<{
      readonly _id: '@effect/cluster/PodAddress'
      readonly host: string
      readonly port: number
    }>
  }
>
```

Added in v1.0.0

## Register\_

**Signature**

```ts
export declare const Register_: Schema.Schema<
  {
    readonly pod: {
      readonly _id: '@effect/cluster/Pod'
      readonly address: { readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }
      readonly version: string
    }
  },
  {
    readonly pod: Data<{
      readonly _id: '@effect/cluster/Pod'
      readonly address: Data<{
        readonly _id: '@effect/cluster/PodAddress'
        readonly host: string
        readonly port: number
      }>
      readonly version: string
    }>
  }
>
```

Added in v1.0.0

## Unregister\_

**Signature**

```ts
export declare const Unregister_: Schema.Schema<
  {
    readonly pod: {
      readonly _id: '@effect/cluster/Pod'
      readonly address: { readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }
      readonly version: string
    }
  },
  {
    readonly pod: Data<{
      readonly _id: '@effect/cluster/Pod'
      readonly address: Data<{
        readonly _id: '@effect/cluster/PodAddress'
        readonly host: string
        readonly port: number
      }>
      readonly version: string
    }>
  }
>
```

Added in v1.0.0
