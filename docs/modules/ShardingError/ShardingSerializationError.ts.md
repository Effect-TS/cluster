---
title: ShardingError/ShardingSerializationError.ts
nav_order: 34
parent: Modules
---

## ShardingSerializationError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingSerializationError](#shardingserializationerror)
- [models](#models)
  - [ShardingSerializationError (interface)](#shardingserializationerror-interface)
- [schema](#schema)
  - [ShardingSerializationErrorSchema](#shardingserializationerrorschema)
- [symbols](#symbols)
  - [ShardingSerializationErrorTag](#shardingserializationerrortag)
- [utils](#utils)
  - [isShardingSerializationError](#isshardingserializationerror)

---

# constructors

## ShardingSerializationError

**Signature**

```ts
export declare function ShardingSerializationError(error: string): ShardingSerializationError
```

Added in v1.0.0

# models

## ShardingSerializationError (interface)

**Signature**

```ts
export interface ShardingSerializationError extends Schema.To<typeof ShardingSerializationErrorSchema_> {}
```

Added in v1.0.0

# schema

## ShardingSerializationErrorSchema

**Signature**

```ts
export declare const ShardingSerializationErrorSchema: Schema.Schema<
  { readonly _tag: '@effect/sharding/ShardingSerializationError'; readonly error: string },
  ShardingSerializationError
>
```

Added in v1.0.0

# symbols

## ShardingSerializationErrorTag

**Signature**

```ts
export declare const ShardingSerializationErrorTag: '@effect/sharding/ShardingSerializationError'
```

Added in v1.0.0

# utils

## isShardingSerializationError

**Signature**

```ts
export declare function isShardingSerializationError(value: any): value is ShardingSerializationError
```

Added in v1.0.0
