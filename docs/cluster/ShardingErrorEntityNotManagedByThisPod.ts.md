---
title: ShardingErrorEntityNotManagedByThisPod.ts
nav_order: 23
parent: "@effect/cluster"
---

## ShardingErrorEntityNotManagedByThisPod overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorEntityNotManagedByThisPod](#shardingerrorentitynotmanagedbythispod)
- [models](#models)
  - [ShardingErrorEntityNotManagedByThisPod (interface)](#shardingerrorentitynotmanagedbythispod-interface)
- [schema](#schema)
  - [ShardingErrorEntityNotManagedByThisPodSchema](#shardingerrorentitynotmanagedbythispodschema)
- [symbols](#symbols)
  - [ShardingErrorEntityNotManagedByThisPodTag](#shardingerrorentitynotmanagedbythispodtag)
- [utils](#utils)
  - [isShardingErrorEntityNotManagedByThisPod](#isshardingerrorentitynotmanagedbythispod)

---

# constructors

## ShardingErrorEntityNotManagedByThisPod

**Signature**

```ts
export declare function ShardingErrorEntityNotManagedByThisPod(entityId: string): ShardingErrorEntityNotManagedByThisPod
```

Added in v1.0.0

# models

## ShardingErrorEntityNotManagedByThisPod (interface)

**Signature**

```ts
export interface ShardingErrorEntityNotManagedByThisPod
  extends Schema.Schema.To<typeof ShardingErrorEntityNotManagedByThisPodSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorEntityNotManagedByThisPodSchema

**Signature**

```ts
export declare const ShardingErrorEntityNotManagedByThisPodSchema: Schema.Schema<
  { readonly _tag: "./ShardingErrorEntityNotManagedByThisPod"; readonly entityId: string },
  ShardingErrorEntityNotManagedByThisPod
>
```

Added in v1.0.0

# symbols

## ShardingErrorEntityNotManagedByThisPodTag

**Signature**

```ts
export declare const ShardingErrorEntityNotManagedByThisPodTag: "./ShardingErrorEntityNotManagedByThisPod"
```

Added in v1.0.0

# utils

## isShardingErrorEntityNotManagedByThisPod

**Signature**

```ts
export declare function isShardingErrorEntityNotManagedByThisPod(
  value: any
): value is ShardingErrorEntityNotManagedByThisPod
```

Added in v1.0.0
