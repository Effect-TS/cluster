---
title: ShardingErrorSendTimeout.ts
nav_order: 31
parent: "@effect/cluster"
---

## ShardingErrorSendTimeout overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorSendTimeout](#shardingerrorsendtimeout)
- [models](#models)
  - [ShardingErrorSendTimeout (interface)](#shardingerrorsendtimeout-interface)
- [schema](#schema)
  - [ShardingErrorSendTimeoutSchema](#shardingerrorsendtimeoutschema)
  - [ShardingErrorSendTimeoutTag](#shardingerrorsendtimeouttag)
- [utils](#utils)
  - [isShardingErrorSendTimeout](#isshardingerrorsendtimeout)

---

# constructors

## ShardingErrorSendTimeout

**Signature**

```ts
export declare function ShardingErrorSendTimeout(): ShardingErrorSendTimeout
```

Added in v1.0.0

# models

## ShardingErrorSendTimeout (interface)

**Signature**

```ts
export interface ShardingErrorSendTimeout extends Schema.Schema.To<typeof ShardingErrorSendTimeoutSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorSendTimeoutSchema

**Signature**

```ts
export declare const ShardingErrorSendTimeoutSchema: Schema.Schema<
  { readonly _tag: '@effect/cluster/ShardingErrorSendTimeout' },
  ShardingErrorSendTimeout
>
```

Added in v1.0.0

## ShardingErrorSendTimeoutTag

**Signature**

```ts
export declare const ShardingErrorSendTimeoutTag: '@effect/cluster/ShardingErrorSendTimeout'
```

Added in v1.0.0

# utils

## isShardingErrorSendTimeout

**Signature**

```ts
export declare function isShardingErrorSendTimeout(value: any): value is ShardingErrorSendTimeout
```

Added in v1.0.0
