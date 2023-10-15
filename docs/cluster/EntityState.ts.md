---
title: EntityState.ts
nav_order: 3
parent: "@effect/cluster"
---

## EntityState overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [EntityState (interface)](#entitystate-interface)
- [modifiers](#modifiers)
  - [withExpirationFiber](#withexpirationfiber)
  - [withoutMessageQueue](#withoutmessagequeue)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare function make<Req>(data: Omit<EntityState<Req>, '_id'>): EntityState<Req>
```

Added in v1.0.0

# models

## EntityState (interface)

**Signature**

```ts
export interface EntityState<Req> {
  readonly _id: TypeId
  readonly messageQueue: Option.Option<MessageQueue.MessageQueue<Req>>
  readonly replyChannels: RefSynchronized.SynchronizedRef<
    HashMap.HashMap<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>
  >
  readonly expirationFiber: Fiber.RuntimeFiber<never, void>
  readonly executionFiber: Fiber.RuntimeFiber<never, void>
}
```

Added in v1.0.0

# modifiers

## withExpirationFiber

**Signature**

```ts
export declare function withExpirationFiber(
  expirationFiber: Fiber.RuntimeFiber<never, void>
): <Req>(entityState: EntityState<Req>) => EntityState<Req>
```

Added in v1.0.0

## withoutMessageQueue

**Signature**

```ts
export declare function withoutMessageQueue<Req>(entityState: EntityState<Req>): EntityState<Req>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: typeof TypeId
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
