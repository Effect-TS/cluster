---
title: PoisonPill.ts
nav_order: 13
parent: "@effect/cluster"
---

## PoisonPill overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [PoisonPill (interface)](#poisonpill-interface)
- [schema](#schema)
  - [schema](#schema-1)
  - [takeOrInterrupt](#takeorinterrupt)
- [symbols](#symbols)
  - [TypeId](#typeid)
- [utils](#utils)
  - [isPoisonPill](#ispoisonpill)

---

# constructors

## make

`PoisonPill`

**Signature**

```ts
export declare const make: PoisonPill
```

Added in v1.0.0

# models

## PoisonPill (interface)

**Signature**

```ts
export interface PoisonPill extends Schema.Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly _id: '@effect/cluster/PoisonPill' },
  Data.Data<{ readonly _id: '@effect/cluster/PoisonPill' }>
>
```

Added in v1.0.0

## takeOrInterrupt

Attempts to take a message from the queue in the same way Queue.take does.
If the result is a PoisonPill, it will interrupt the effect.

**Signature**

```ts
export declare function takeOrInterrupt<Req>(dequeue: Queue.Dequeue<Req | PoisonPill>): Effect.Effect<never, never, Req>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/cluster/PoisonPill'
```

Added in v1.0.0

# utils

## isPoisonPill

**Signature**

```ts
export declare function isPoisonPill(value: unknown): value is PoisonPill
```

Added in v1.0.0
