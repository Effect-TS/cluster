---
title: ShardingErrorMessageQueue.ts
nav_order: 25
parent: "@effect/cluster"
---

## ShardingErrorMessageQueue overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorMessageQueue](#shardingerrormessagequeue)
- [models](#models)
  - [ShardingErrorMessageQueue (interface)](#shardingerrormessagequeue-interface)
- [schema](#schema)
  - [ShardingErrorMessageQueueSchema](#shardingerrormessagequeueschema)
- [symbols](#symbols)
  - [ShardingErrorMessageQueueTag](#shardingerrormessagequeuetag)
- [utils](#utils)
  - [isShardingErrorMessageQueue](#isshardingerrormessagequeue)

---

# constructors

## ShardingErrorMessageQueue

**Signature**

```ts
export declare function ShardingErrorMessageQueue(error: string): ShardingErrorMessageQueue
```

Added in v1.0.0

# models

## ShardingErrorMessageQueue (interface)

**Signature**

```ts
export interface ShardingErrorMessageQueue extends Schema.Schema.To<typeof ShardingErrorMessageQueueSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorMessageQueueSchema

**Signature**

```ts
export declare const ShardingErrorMessageQueueSchema: Schema.Schema<
  { readonly _tag: "./ShardingErrorMessageQueue"; readonly error: string },
  ShardingErrorMessageQueue
>
```

Added in v1.0.0

# symbols

## ShardingErrorMessageQueueTag

**Signature**

```ts
export declare const ShardingErrorMessageQueueTag: "./ShardingErrorMessageQueue"
```

Added in v1.0.0

# utils

## isShardingErrorMessageQueue

**Signature**

```ts
export declare function isShardingErrorMessageQueue(value: unknown): value is ShardingErrorMessageQueue
```

Added in v1.0.0
