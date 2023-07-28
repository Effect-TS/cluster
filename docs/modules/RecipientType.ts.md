---
title: RecipientType.ts
nav_order: 17
parent: Modules
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
export declare function makeEntityType<I extends JsonData, Msg>(
  name: string,
  schema: Schema.Schema<I, Msg>
): EntityType<Msg>
```

Added in v1.0.0

## makeTopicType

**Signature**

```ts
export declare function makeTopicType<I extends JsonData, Msg>(
  name: string,
  schema: Schema.Schema<I, Msg>
): TopicType<Msg>
```

Added in v1.0.0

# models

## EntityType (interface)

**Signature**

```ts
export interface EntityType<Msg> {
  _tag: 'EntityType'
  name: string
  schema: Schema.Schema<JsonData, Msg>
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
  _tag: 'TopicType'
  name: string
  schema: Schema.Schema<JsonData, Msg>
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
