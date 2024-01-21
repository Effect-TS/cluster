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
  - [PoisonPillTypeId](#poisonpilltypeid)
  - [PoisonPillTypeId (type alias)](#poisonpilltypeid-type-alias)
- [utils](#utils)
  - [isPoisonPill](#ispoisonpill)

---

# constructors

## make

`PoisonPill`

**Signature**

```ts
export declare const make: Effect.Effect<never, never, PoisonPill>
```

Added in v1.0.0

# models

## PoisonPill (interface)

**Signature**

```ts
export interface PoisonPill
  extends Data.Data<{
    [PoisonPillTypeId]: PoisonPillTypeId
  }> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly "@effect/cluster/PoisonPill": "@effect/cluster/PoisonPill" },
  Data.Data<{ readonly [PoisonPillTypeId]: typeof PoisonPillTypeId }>
>
```

Added in v1.0.0

## takeOrInterrupt

Attempts to take a message from the queue in the same way Queue.take does.
If the result is a PoisonPill, it will interrupt the effect.

**Signature**

```ts
export declare const takeOrInterrupt: <Req>(
  dequeue: Queue.Dequeue<PoisonPill | Req>
) => Effect.Effect<never, never, Req>
```

Added in v1.0.0

# symbols

## PoisonPillTypeId

**Signature**

```ts
export declare const PoisonPillTypeId: typeof PoisonPillTypeId
```

Added in v1.0.0

## PoisonPillTypeId (type alias)

**Signature**

```ts
export type PoisonPillTypeId = typeof PoisonPillTypeId
```

Added in v1.0.0

# utils

## isPoisonPill

**Signature**

```ts
export declare const isPoisonPill: (value: unknown) => value is PoisonPill
```

Added in v1.0.0
