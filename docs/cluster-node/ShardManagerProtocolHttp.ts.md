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
export declare const GetAssignmentsResult_: Schema.array<Schema.tupleType<any, [Schema.option<any>]>>
```

Added in v1.0.0

## NotifyUnhealthyPod\_

**Signature**

```ts
export declare const NotifyUnhealthyPod_: Schema.struct<{ podAddress: any }>
```

Added in v1.0.0

## Register\_

**Signature**

```ts
export declare const Register_: Schema.struct<{ pod: any }>
```

Added in v1.0.0

## Unregister\_

**Signature**

```ts
export declare const Unregister_: Schema.struct<{ pod: any }>
```

Added in v1.0.0
