---
title: ShardingErrorNoResultInMessageProcessedState.ts
nav_order: 26
parent: "@effect/cluster"
---

## ShardingErrorNoResultInMessageProcessedState overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorNoResultInProcessedMessageState](#shardingerrornoresultinprocessedmessagestate)
- [models](#models)
  - [ShardingErrorNoResultInProcessedMessageState (interface)](#shardingerrornoresultinprocessedmessagestate-interface)
- [schema](#schema)
  - [ShardingErrorNoResultInProcessedMessageStateSchema](#shardingerrornoresultinprocessedmessagestateschema)
- [symbols](#symbols)
  - [ShardingErrorNoResultInProcessedMessageStateTag](#shardingerrornoresultinprocessedmessagestatetag)
- [utils](#utils)
  - [isShardingErrorNoResultInProcessedMessageState](#isshardingerrornoresultinprocessedmessagestate)

---

# constructors

## ShardingErrorNoResultInProcessedMessageState

**Signature**

```ts
export declare function ShardingErrorNoResultInProcessedMessageState(): ShardingErrorNoResultInProcessedMessageState;
```

Added in v1.0.0

# models

## ShardingErrorNoResultInProcessedMessageState (interface)

**Signature**

```ts
export interface ShardingErrorNoResultInProcessedMessageState
  extends Schema.Schema.Type<
    typeof ShardingErrorNoResultInProcessedMessageStateSchema_
  > {}
```

Added in v1.0.0

# schema

## ShardingErrorNoResultInProcessedMessageStateSchema

**Signature**

```ts
export declare const ShardingErrorNoResultInProcessedMessageStateSchema: Schema.Schema<
  ShardingErrorNoResultInProcessedMessageState,
  { readonly _tag: "./ShardingErrorNoResultInProcessedMessageState" },
  never
>;
```

Added in v1.0.0

# symbols

## ShardingErrorNoResultInProcessedMessageStateTag

**Signature**

```ts
export declare const ShardingErrorNoResultInProcessedMessageStateTag: "./ShardingErrorNoResultInProcessedMessageState";
```

Added in v1.0.0

# utils

## isShardingErrorNoResultInProcessedMessageState

**Signature**

```ts
export declare function isShardingErrorNoResultInProcessedMessageState(
  value: unknown
): value is ShardingErrorNoResultInProcessedMessageState;
```

Added in v1.0.0
