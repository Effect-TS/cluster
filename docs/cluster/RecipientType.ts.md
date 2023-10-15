---
title: RecipientType.ts
nav_order: 15
parent: "@effect/cluster"
---

## RecipientType overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [makeEntityType](#makeentitytype)
  - [makeTopicType](#maketopictype)
- [models](#models)
  - [EntityType (interface)](#entitytype-interface)
  - [RecipientType (type alias)](#recipienttype-type-alias)
  - [TopicType (interface)](#topictype-interface)
- [utils](#utils)
  - [getShardId](#getshardid)

---

# constructors

## makeEntityType

**Signature**

```ts
export declare function makeEntityType<I, Msg>(name: string, schema: Schema.Schema<I, Msg>): EntityType<Msg>
```

Added in v1.0.0

## makeTopicType

**Signature**

```ts
export declare function makeTopicType<I, Msg>(name: string, schema: Schema.Schema<I, Msg>): TopicType<Msg>
```

Added in v1.0.0

# models

## EntityType (interface)

**Signature**

```ts
export interface EntityType<Msg> {
  readonly _tag: 'EntityType'
  readonly name: string
  readonly schema: Schema.Schema<unknown, Msg>
}
```

Added in v1.0.0

## RecipientType (type alias)

An abstract type to extend for each type of entity or topic

**Signature**

```ts
export type RecipientType<Msg> = EntityType<Msg> | TopicType<Msg>
```

Added in v1.0.0

## TopicType (interface)

**Signature**

```ts
export interface TopicType<Msg> {
  readonly _tag: 'TopicType'
  readonly name: string
  readonly schema: Schema.Schema<unknown, Msg>
}
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
