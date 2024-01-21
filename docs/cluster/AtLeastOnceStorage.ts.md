---
title: AtLeastOnceStorage.ts
nav_order: 2
parent: "@effect/cluster"
---

## AtLeastOnceStorage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [context](#context)
  - [Tag](#tag)
- [models](#models)
  - [AtLeastOnceStorage (interface)](#atleastoncestorage-interface)
- [symbols](#symbols)
  - [AtLeastOnceStorageTypeId](#atleastoncestoragetypeid)
  - [AtLeastOnceStorageTypeId (type alias)](#atleastoncestoragetypeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare const make: (data: Omit<AtLeastOnceStorage, AtLeastOnceStorageTypeId>) => AtLeastOnceStorage
```

Added in v1.0.0

# context

## Tag

**Signature**

```ts
export declare const Tag: Context.Tag<AtLeastOnceStorage, AtLeastOnceStorage>
```

Added in v1.0.0

# models

## AtLeastOnceStorage (interface)

**Signature**

```ts
export interface AtLeastOnceStorage {
  readonly [AtLeastOnceStorageTypeId]: AtLeastOnceStorageTypeId

  /**
   * Stores a message into the storage, eventually returning the already existing message state as result in the storage
   */
  upsert<Msg>(
    recipientType: RecipientType.RecipientType<Msg>,
    shardId: ShardId.ShardId,
    entityId: string,
    message: Msg
  ): Effect.Effect<never, ShardingError.ShardingErrorWhileOfferingMessage, void>

  /**
   * Marks the message as processed, so no more send attempt will occur
   */
  markAsProcessed<Msg>(
    recipientType: RecipientType.RecipientType<Msg>,
    shardId: ShardId.ShardId,
    entityId: string,
    message: Msg
  ): Effect.Effect<never, ShardingError.ShardingErrorWhileOfferingMessage, void>

  /**
   * Gets a set of messages that will be sent to the local Pod as second attempt
   */
  sweepPending(shardIds: Iterable<ShardId.ShardId>): Stream.Stream<never, never, SerializedEnvelope.SerializedEnvelope>
}
```

Added in v1.0.0

# symbols

## AtLeastOnceStorageTypeId

**Signature**

```ts
export declare const AtLeastOnceStorageTypeId: typeof AtLeastOnceStorageTypeId
```

Added in v1.0.0

## AtLeastOnceStorageTypeId (type alias)

**Signature**

```ts
export type AtLeastOnceStorageTypeId = typeof AtLeastOnceStorageTypeId
```

Added in v1.0.0
