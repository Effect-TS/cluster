---
title: ShardingError/ShardingEntityNotManagedByThisPodError.ts
nav_order: 28
parent: Modules
---

## ShardingEntityNotManagedByThisPodError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingEntityNotManagedByThisPodError](#shardingentitynotmanagedbythispoderror)
- [models](#models)
  - [ShardingEntityNotManagedByThisPodError (interface)](#shardingentitynotmanagedbythispoderror-interface)
- [schema](#schema)
  - [ShardingEntityNotManagedByThisPodErrorSchema](#shardingentitynotmanagedbythispoderrorschema)
- [symbols](#symbols)
  - [ShardingEntityNotManagedByThisPodErrorTag](#shardingentitynotmanagedbythispoderrortag)
- [utils](#utils)
  - [isShardingEntityNotManagedByThisPodError](#isshardingentitynotmanagedbythispoderror)

---

# constructors

## ShardingEntityNotManagedByThisPodError

**Signature**

```ts
export declare function ShardingEntityNotManagedByThisPodError(entityId: string): ShardingEntityNotManagedByThisPodError
```

Added in v1.0.0

# models

## ShardingEntityNotManagedByThisPodError (interface)

**Signature**

```ts
export interface ShardingEntityNotManagedByThisPodError
  extends Schema.To<typeof ShardingEntityNotManagedByThisPodErrorSchema_> {}
```

Added in v1.0.0

# schema

## ShardingEntityNotManagedByThisPodErrorSchema

**Signature**

```ts
export declare const ShardingEntityNotManagedByThisPodErrorSchema: Schema.Schema<
  { readonly entityId: string; readonly _tag: '@effect/sharding/ShardingEntityNotManagedByThisPodError' },
  ShardingEntityNotManagedByThisPodError
>
```

Added in v1.0.0

# symbols

## ShardingEntityNotManagedByThisPodErrorTag

**Signature**

```ts
export declare const ShardingEntityNotManagedByThisPodErrorTag: '@effect/sharding/ShardingEntityNotManagedByThisPodError'
```

Added in v1.0.0

# utils

## isShardingEntityNotManagedByThisPodError

**Signature**

```ts
export declare function isShardingEntityNotManagedByThisPodError(
  value: any
): value is ShardingEntityNotManagedByThisPodError
```

Added in v1.0.0
