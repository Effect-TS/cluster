---
title: ShardingErrorWhileOfferingMessage.ts
nav_order: 25
parent: "@effect/cluster"
---

## ShardingErrorWhileOfferingMessage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorWhileOfferingMessage](#ShardingErrorWhileOfferingMessage)
- [models](#models)
  - [ShardingErrorWhileOfferingMessage (interface)](#ShardingErrorWhileOfferingMessage-interface)
- [schema](#schema)
  - [ShardingErrorWhileOfferingMessageSchema](#ShardingErrorWhileOfferingMessageschema)
- [symbols](#symbols)
  - [ShardingErrorWhileOfferingMessageTag](#ShardingErrorWhileOfferingMessagetag)
- [utils](#utils)
  - [isShardingErrorWhileOfferingMessage](#isShardingErrorWhileOfferingMessage)

---

# constructors

## ShardingErrorWhileOfferingMessage

**Signature**

```ts
export declare function ShardingErrorWhileOfferingMessage(
  error: string
): ShardingErrorWhileOfferingMessage;
```

Added in v1.0.0

# models

## ShardingErrorWhileOfferingMessage (interface)

**Signature**

```ts
export interface ShardingErrorWhileOfferingMessage
  extends Schema.Schema.To<typeof ShardingErrorWhileOfferingMessageSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorWhileOfferingMessageSchema

**Signature**

```ts
export declare const ShardingErrorWhileOfferingMessageSchema: Schema.Schema<
  {
    readonly _tag: "./ShardingErrorWhileOfferingMessage";
    readonly error: string;
  },
  ShardingErrorWhileOfferingMessage
>;
```

Added in v1.0.0

# symbols

## ShardingErrorWhileOfferingMessageTag

**Signature**

```ts
export declare const ShardingErrorWhileOfferingMessageTag: "./ShardingErrorWhileOfferingMessage";
```

Added in v1.0.0

# utils

## isShardingErrorWhileOfferingMessage

**Signature**

```ts
export declare function isShardingErrorWhileOfferingMessage(
  value: unknown
): value is ShardingErrorWhileOfferingMessage;
```

Added in v1.0.0
