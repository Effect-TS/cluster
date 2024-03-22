---
title: ShardingErrorSerialization.ts
nav_order: 30
parent: "@effect/cluster"
---

## ShardingErrorSerialization overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorSerialization](#shardingerrorserialization)
- [models](#models)
  - [ShardingErrorSerialization (interface)](#shardingerrorserialization-interface)
- [schema](#schema)
  - [ShardingErrorSerializationSchema](#shardingerrorserializationschema)
- [symbols](#symbols)
  - [ShardingErrorSerializationTag](#shardingerrorserializationtag)
- [utils](#utils)
  - [isShardingErrorSerialization](#isshardingerrorserialization)

---

# constructors

## ShardingErrorSerialization

**Signature**

```ts
export declare function ShardingErrorSerialization(
  error: string
): ShardingErrorSerialization;
```

Added in v1.0.0

# models

## ShardingErrorSerialization (interface)

**Signature**

```ts
export interface ShardingErrorSerialization
  extends Schema.Schema.Type<typeof ShardingErrorSerializationSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorSerializationSchema

**Signature**

```ts
export declare const ShardingErrorSerializationSchema: Schema.Schema<
  ShardingErrorSerialization,
  { readonly _tag: "./ShardingErrorSerialization"; readonly error: string },
  never
>;
```

Added in v1.0.0

# symbols

## ShardingErrorSerializationTag

**Signature**

```ts
export declare const ShardingErrorSerializationTag: "./ShardingErrorSerialization";
```

Added in v1.0.0

# utils

## isShardingErrorSerialization

**Signature**

```ts
export declare function isShardingErrorSerialization(
  value: any
): value is ShardingErrorSerialization;
```

Added in v1.0.0
