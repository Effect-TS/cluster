---
title: ShardingError/ShardingSendTimeoutError.ts
nav_order: 33
parent: Modules
---

## ShardingSendTimeoutError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingSendTimeoutError](#shardingsendtimeouterror)
- [models](#models)
  - [ShardingSendTimeoutError (interface)](#shardingsendtimeouterror-interface)
- [schema](#schema)
  - [ShardingSendTimeoutErrorSchema](#shardingsendtimeouterrorschema)
  - [ShardingSendTimeoutErrorTag](#shardingsendtimeouterrortag)
- [utils](#utils)
  - [isShardingSendTimeoutError](#isshardingsendtimeouterror)

---

# constructors

## ShardingSendTimeoutError

**Signature**

```ts
export declare function ShardingSendTimeoutError(): ShardingSendTimeoutError
```

Added in v1.0.0

# models

## ShardingSendTimeoutError (interface)

**Signature**

```ts
export interface ShardingSendTimeoutError extends Schema.To<typeof ShardingSendTimeoutErrorSchema_> {}
```

Added in v1.0.0

# schema

## ShardingSendTimeoutErrorSchema

**Signature**

```ts
export declare const ShardingSendTimeoutErrorSchema: Schema.Schema<
  { readonly _tag: '@effect/sharding/ShardingSendTimeoutError' },
  ShardingSendTimeoutError
>
```

Added in v1.0.0

## ShardingSendTimeoutErrorTag

**Signature**

```ts
export declare const ShardingSendTimeoutErrorTag: '@effect/sharding/ShardingSendTimeoutError'
```

Added in v1.0.0

# utils

## isShardingSendTimeoutError

**Signature**

```ts
export declare function isShardingSendTimeoutError(value: any): value is ShardingSendTimeoutError
```

Added in v1.0.0
