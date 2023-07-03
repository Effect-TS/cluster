---
title: RecipientType.ts
nav_order: 16
parent: Modules
---

## RecipientType overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [RecipientType (type alias)](#recipienttype-type-alias)
- [utils](#utils)
  - [getShardId](#getshardid)

---

# constructors

## make

**Signature**

```ts
export declare function make<Msg>(name: string, schema: Schema.Schema<Msg>): RecipientType<Msg>
```

Added in v1.0.0

# models

## RecipientType (type alias)

An abstract type to extend for each type of entity or topic

**Signature**

```ts
export type RecipientType<Msg> = EntityType<Msg> | TopicType<Msg>
```

Added in v1.0.0

# utils

## getShardId

Gets the shard id where this entity should run.

**Signature**

```ts
export declare const getShardId: (entityId: string, numberOfShards: number) => ShardId.ShardId
```

Added in v1.0.0
