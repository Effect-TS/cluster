---
title: ShardingErrorWhileOfferingMessage.ts
nav_order: 31
parent: "@effect/cluster"
---

## ShardingErrorWhileOfferingMessage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorWhileOfferingMessage](#shardingerrorwhileofferingmessage)
- [models](#models)
  - [ShardingErrorWhileOfferingMessage (interface)](#shardingerrorwhileofferingmessage-interface)
- [schema](#schema)
  - [ShardingErrorWhileOfferingMessageSchema](#shardingerrorwhileofferingmessageschema)
- [symbols](#symbols)
  - [ShardingErrorWhileOfferingMessageTag](#shardingerrorwhileofferingmessagetag)
- [utils](#utils)
  - [isShardingErrorWhileOfferingMessage](#isshardingerrorwhileofferingmessage)

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
  extends Schema.Schema.Type<typeof ShardingErrorWhileOfferingMessageSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorWhileOfferingMessageSchema

**Signature**

```ts
export declare const ShardingErrorWhileOfferingMessageSchema: Schema.Schema<
  ShardingErrorWhileOfferingMessage,
  {
    readonly _tag: "./ShardingErrorWhileOfferingMessage";
    readonly error: string;
  },
  never
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
