---
title: ShardingRegistrationEvent.ts
nav_order: 33
parent: "@effect/cluster"
---

## ShardingRegistrationEvent overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [EntityRegistered](#entityregistered)
  - [SingletonRegistered](#singletonregistered)
  - [TopicRegistered](#topicregistered)
- [models](#models)
  - [ShardingRegistrationEvent (type alias)](#shardingregistrationevent-type-alias)

---

# constructors

## EntityRegistered

**Signature**

```ts
export declare function EntityRegistered<Msg>(entityType: RecipientType.EntityType<Msg>): ShardingRegistrationEvent
```

Added in v1.0.0

## SingletonRegistered

**Signature**

```ts
export declare function SingletonRegistered(name: string): ShardingRegistrationEvent
```

Added in v1.0.0

## TopicRegistered

**Signature**

```ts
export declare function TopicRegistered<Msg>(topicType: RecipientType.TopicType<Msg>): ShardingRegistrationEvent
```

Added in v1.0.0

# models

## ShardingRegistrationEvent (type alias)

**Signature**

```ts
export type ShardingRegistrationEvent = EntityRegistered<any> | SingletonRegistered | TopicRegistered<any>
```

Added in v1.0.0
