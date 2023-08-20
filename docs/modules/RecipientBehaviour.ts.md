---
title: RecipientBehaviour.ts
nav_order: 18
parent: Modules
---

## RecipientBehaviour overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [dequeue](#dequeue)
  - [process](#process)
- [models](#models)
  - [RecipientBehaviour (interface)](#recipientbehaviour-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [utils](#utils)
  - [onReceive](#onreceive)

---

# constructors

## dequeue

**Signature**

```ts
export declare function dequeue<I extends JsonData, Msg, R>(
  schema: Schema.Schema<I, Msg>,
  dequeue: (entityId: string, dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>) => Effect.Effect<R, never, void>
): RecipientBehaviour<R, Msg>
```

Added in v1.0.0

## process

**Signature**

```ts
export declare function process<I extends JsonData, Msg, R>(
  schema: Schema.Schema<I, Msg>,
  process: (entityId: string, msg: Msg) => Effect.Effect<R, never, void>
): RecipientBehaviour<R, Msg>
```

Added in v1.0.0

# models

## RecipientBehaviour (interface)

An abstract type to extend for each type of entity or topic

**Signature**

```ts
export interface RecipientBehaviour<R, Msg> {
  readonly _id: TypeId
  readonly schema: Schema.Schema<JsonData, Msg>
  readonly dequeue: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>
  ) => Effect.Effect<R, never, void>
  readonly accept: (entityId: string, msg: Msg) => Effect.Effect<R, Throwable, void>
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/ByteArray'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0

# utils

## onReceive

**Signature**

```ts
export declare function onReceive<Msg, R>(
  accept: (entityId: string, msg: Msg, next: Effect.Effect<never, Throwable, void>) => Effect.Effect<R, Throwable, void>
)
```

Added in v1.0.0
