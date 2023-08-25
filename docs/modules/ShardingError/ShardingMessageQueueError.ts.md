---
title: ShardingError/ShardingMessageQueueError.ts
nav_order: 30
parent: Modules
---

## ShardingMessageQueueError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingMessageQueueError](#shardingmessagequeueerror)
- [models](#models)
  - [ShardingMessageQueueError (interface)](#shardingmessagequeueerror-interface)
- [schema](#schema)
  - [ShardingMessageQueueErrorSchema](#shardingmessagequeueerrorschema)
- [symbols](#symbols)
  - [ShardingMessageQueueErrorTag](#shardingmessagequeueerrortag)
- [utils](#utils)
  - [isShardingMessageQueueError](#isshardingmessagequeueerror)

---

# constructors

## ShardingMessageQueueError

**Signature**

```ts
export declare function ShardingMessageQueueError(error: string): ShardingMessageQueueError
```

Added in v1.0.0

# models

## ShardingMessageQueueError (interface)

**Signature**

```ts
export interface ShardingMessageQueueError extends Schema.To<typeof ShardingMessageQueueErrorSchema_> {}
```

Added in v1.0.0

# schema

## ShardingMessageQueueErrorSchema

**Signature**

```ts
export declare const ShardingMessageQueueErrorSchema: Schema.Schema<
  { readonly _tag: '@effect/shardcake/ShardingMessageQueueError'; readonly error: string },
  ShardingMessageQueueError
>
```

Added in v1.0.0

# symbols

## ShardingMessageQueueErrorTag

**Signature**

```ts
export declare const ShardingMessageQueueErrorTag: '@effect/shardcake/ShardingMessageQueueError'
```

Added in v1.0.0

# utils

## isShardingMessageQueueError

**Signature**

```ts
export declare function isShardingMessageQueueError(value: unknown): value is ShardingMessageQueueError
```

Added in v1.0.0
