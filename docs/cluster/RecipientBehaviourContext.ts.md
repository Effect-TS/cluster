---
title: RecipientBehaviourContext.ts
nav_order: 16
parent: "@effect/cluster"
---

## RecipientBehaviourContext overview

Added in v1.0.0
This module provides the context that is given to a RecipientBehaviour

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [context](#context)
  - [RecipientBehaviourContext](#recipientbehaviourcontext)
- [models](#models)
  - [RecipientBehaviourContext (interface)](#recipientbehaviourcontext-interface)
- [symbols](#symbols)
  - [RecipientBehaviourContextTypeId](#recipientbehaviourcontexttypeid)
  - [RecipientBehaviourContextTypeId (type alias)](#recipientbehaviourcontexttypeid-type-alias)
- [utils](#utils)
  - [entityId](#entityid)
  - [forkShutdown](#forkshutdown)
  - [recipientType](#recipienttype)
  - [shardId](#shardid)

---

# constructors

## make

Creates a new RecipientBehaviourContext

**Signature**

```ts
export declare const make: (
  args: Omit<RecipientBehaviourContext, typeof RecipientBehaviourContextTypeId>
) => RecipientBehaviourContext
```

Added in v1.0.0

# context

## RecipientBehaviourContext

A tag to access current RecipientBehaviour

**Signature**

```ts
export declare const RecipientBehaviourContext: Context.Tag<RecipientBehaviourContext, RecipientBehaviourContext>
```

Added in v1.0.0

# models

## RecipientBehaviourContext (interface)

The context where a RecipientBehaviour is running, knows the current entityId, entityType, etc...

**Signature**

```ts
export interface RecipientBehaviourContext {
  readonly [RecipientBehaviourContextTypeId]: RecipientBehaviourContextTypeId
  readonly entityId: string
  readonly shardId: ShardId.ShardId
  readonly recipientType: RecipientType.RecipientType<Message.Any>
  readonly forkShutdown: Effect.Effect<never, never, void>
}
```

Added in v1.0.0

# symbols

## RecipientBehaviourContextTypeId

**Signature**

```ts
export declare const RecipientBehaviourContextTypeId: typeof RecipientBehaviourContextTypeId
```

Added in v1.0.0

## RecipientBehaviourContextTypeId (type alias)

**Signature**

```ts
export type RecipientBehaviourContextTypeId = typeof RecipientBehaviourContextTypeId
```

Added in v1.0.0

# utils

## entityId

Gets the current entityId

**Signature**

```ts
export declare const entityId: Effect.Effect<RecipientBehaviourContext, never, string>
```

Added in v1.0.0

## forkShutdown

Forks the shutdown of the current recipient

**Signature**

```ts
export declare const forkShutdown: Effect.Effect<RecipientBehaviourContext, never, void>
```

Added in v1.0.0

## recipientType

Gets the current shardId

**Signature**

```ts
export declare const recipientType: Effect.Effect<
  RecipientBehaviourContext,
  never,
  RecipientType.RecipientType<Message.Any>
>
```

Added in v1.0.0

## shardId

Gets the current shardId

**Signature**

```ts
export declare const shardId: Effect.Effect<RecipientBehaviourContext, never, ShardId.ShardId>
```

Added in v1.0.0
