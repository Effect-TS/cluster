---
title: ShardManagerProtocolHttp.ts
nav_order: 36
parent: Modules
---

## ShardManagerProtocolHttp overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [schema](#schema)
  - [GetAssignmentsResult\_](#getassignmentsresult_)
  - [GetAssignments\_](#getassignments_)
  - [NotifyUnhealthyPodResult\_](#notifyunhealthypodresult_)
  - [NotifyUnhealthyPod\_](#notifyunhealthypod_)
  - [RegisterResult\_](#registerresult_)
  - [Register\_](#register_)
  - [UnregisterResult\_](#unregisterresult_)
  - [Unregister\_](#unregister_)
  - [schema](#schema-1)

---

# schema

## GetAssignmentsResult\_

**Signature**

```ts
export declare const GetAssignmentsResult_: Schema.Schema<
  | { readonly _tag: 'Left'; readonly left: never }
  | {
      readonly _tag: 'Right'
      readonly right: readonly (readonly [
        { readonly _id: '@effect/shardcake/ShardId'; readonly value: number },
        (
          | { readonly _tag: 'None' }
          | {
              readonly _tag: 'Some'
              readonly value: {
                readonly _id: '@effect/shardcake/PodAddress'
                readonly host: string
                readonly port: number
              }
            }
        )
      ])[]
    },
  Either<
    never,
    readonly (readonly [
      Data<{ readonly _id: '@effect/shardcake/ShardId'; readonly value: number }>,
      Option<Data<{ readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }>>
    ])[]
  >
>
```

Added in v1.0.0

## GetAssignments\_

**Signature**

```ts
export declare const GetAssignments_: Schema.Schema<
  { readonly _tag: 'GetAssignments' },
  { readonly _tag: 'GetAssignments' }
>
```

Added in v1.0.0

## NotifyUnhealthyPodResult\_

**Signature**

```ts
export declare const NotifyUnhealthyPodResult_: Schema.Schema<
  { readonly _tag: 'Left'; readonly left: never } | { readonly _tag: 'Right'; readonly right: boolean },
  Either<never, boolean>
>
```

Added in v1.0.0

## NotifyUnhealthyPod\_

**Signature**

```ts
export declare const NotifyUnhealthyPod_: Schema.Schema<
  {
    readonly _tag: 'NotifyUnhealthyPod'
    readonly podAddress: { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }
  },
  {
    readonly _tag: 'NotifyUnhealthyPod'
    readonly podAddress: Data<{
      readonly _id: '@effect/shardcake/PodAddress'
      readonly host: string
      readonly port: number
    }>
  }
>
```

Added in v1.0.0

## RegisterResult\_

**Signature**

```ts
export declare const RegisterResult_: Schema.Schema<
  { readonly _tag: 'Left'; readonly left: never } | { readonly _tag: 'Right'; readonly right: boolean },
  Either<never, boolean>
>
```

Added in v1.0.0

## Register\_

**Signature**

```ts
export declare const Register_: Schema.Schema<
  {
    readonly _tag: 'Register'
    readonly pod: {
      readonly _id: '@effect/shardcake/Pod'
      readonly address: { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }
      readonly version: string
    }
  },
  {
    readonly _tag: 'Register'
    readonly pod: Data<{
      readonly _id: '@effect/shardcake/Pod'
      readonly address: Data<{
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }>
      readonly version: string
    }>
  }
>
```

Added in v1.0.0

## UnregisterResult\_

**Signature**

```ts
export declare const UnregisterResult_: Schema.Schema<
  { readonly _tag: 'Left'; readonly left: never } | { readonly _tag: 'Right'; readonly right: boolean },
  Either<never, boolean>
>
```

Added in v1.0.0

## Unregister\_

**Signature**

```ts
export declare const Unregister_: Schema.Schema<
  {
    readonly _tag: 'Unregister'
    readonly pod: {
      readonly _id: '@effect/shardcake/Pod'
      readonly address: { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }
      readonly version: string
    }
  },
  {
    readonly _tag: 'Unregister'
    readonly pod: Data<{
      readonly _id: '@effect/shardcake/Pod'
      readonly address: Data<{
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }>
      readonly version: string
    }>
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
      readonly _tag: 'Register'
      readonly pod: {
        readonly _id: '@effect/shardcake/Pod'
        readonly address: { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }
        readonly version: string
      }
    }
  | {
      readonly _tag: 'Unregister'
      readonly pod: {
        readonly _id: '@effect/shardcake/Pod'
        readonly address: { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }
        readonly version: string
      }
    }
  | {
      readonly _tag: 'NotifyUnhealthyPod'
      readonly podAddress: {
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }
    }
  | { readonly _tag: 'GetAssignments' },
  | {
      readonly _tag: 'Register'
      readonly pod: Data<{
        readonly _id: '@effect/shardcake/Pod'
        readonly address: Data<{
          readonly _id: '@effect/shardcake/PodAddress'
          readonly host: string
          readonly port: number
        }>
        readonly version: string
      }>
    }
  | {
      readonly _tag: 'Unregister'
      readonly pod: Data<{
        readonly _id: '@effect/shardcake/Pod'
        readonly address: Data<{
          readonly _id: '@effect/shardcake/PodAddress'
          readonly host: string
          readonly port: number
        }>
        readonly version: string
      }>
    }
  | {
      readonly _tag: 'NotifyUnhealthyPod'
      readonly podAddress: Data<{
        readonly _id: '@effect/shardcake/PodAddress'
        readonly host: string
        readonly port: number
      }>
    }
  | { readonly _tag: 'GetAssignments' }
>
```

Added in v1.0.0
