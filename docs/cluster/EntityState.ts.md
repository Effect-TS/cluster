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
  - [withLastReceivedAd](#withlastreceivedad)
  - [withTerminationFiber](#withterminationfiber)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare function make<Req>(data: Omit<EntityState<Req>, "_id">): EntityState<Req>
```

Added in v1.0.0

# models

## EntityState (interface)

**Signature**

```ts
export interface EntityState<Req> {
  readonly _id: TypeId
  readonly offer: (message: Req) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
  readonly replyChannels: RefSynchronized.SynchronizedRef<
    HashMap.HashMap<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>
  >
  readonly expirationFiber: Fiber.RuntimeFiber<never, void>
  readonly executionScope: Scope.CloseableScope
  readonly terminationFiber: Option.Option<Fiber.RuntimeFiber<never, void>>
  readonly lastReceivedAt: number
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

## withLastReceivedAd

**Signature**

```ts
export declare function withLastReceivedAd(
  lastReceivedAt: number
): <Req>(entityState: EntityState<Req>) => EntityState<Req>
```

Added in v1.0.0

## withTerminationFiber

**Signature**

```ts
export declare function withTerminationFiber(
  terminationFiber: Fiber.RuntimeFiber<never, void>
): <Req>(entityState: EntityState<Req>) => EntityState<Req>
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
