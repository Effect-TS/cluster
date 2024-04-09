---
title: MessageState.ts
nav_order: 7
parent: "@effect/cluster"
---

## MessageState overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [Acknowledged](#acknowledged)
  - [Processed](#processed)
- [models](#models)
  - [MessageState (type alias)](#messagestate-type-alias)
  - [MessageState (namespace)](#messagestate-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [MessageStateAcknowledged (interface)](#messagestateacknowledged-interface)
  - [MessageStateProcessed (interface)](#messagestateprocessed-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [MessageStateTypeId](#messagestatetypeid)
  - [MessageStateTypeId (type alias)](#messagestatetypeid-type-alias)
- [utils](#utils)
  - [isMessageState](#ismessagestate)
  - [mapEffect](#mapeffect)
  - [match](#match)

---

# constructors

## Acknowledged

**Signature**

```ts
export declare const Acknowledged: MessageStateAcknowledged
```

Added in v1.0.0

## Processed

**Signature**

```ts
export declare const Processed: <A>(result: Option.Option<A>) => MessageStateProcessed<A>
```

Added in v1.0.0

# models

## MessageState (type alias)

**Signature**

```ts
export type MessageState<A> = MessageStateAcknowledged | MessageStateProcessed<A>
```

Added in v1.0.0

## MessageState (namespace)

Added in v1.0.0

### Encoded (type alias)

**Signature**

```ts
export type Encoded<I> =
  | {
      readonly "@effect/cluster/MessageState": "@effect/cluster/MessageState"
      readonly _tag: "@effect/cluster/MessageState/Acknowledged"
    }
  | {
      readonly result: Schema.OptionEncoded<I>
      readonly "@effect/cluster/MessageState": "@effect/cluster/MessageState"
      readonly _tag: "@effect/cluster/MessageState/Processed"
    }
```

Added in v1.0.0

## MessageStateAcknowledged (interface)

A message state given to just acknowledged messages

**Signature**

```ts
export interface MessageStateAcknowledged {
  readonly [MessageStateTypeId]: MessageStateTypeId
  readonly _tag: "@effect/cluster/MessageState/Acknowledged"
}
```

Added in v1.0.0

## MessageStateProcessed (interface)

A message state given to processed messages

**Signature**

```ts
export interface MessageStateProcessed<A> {
  readonly [MessageStateTypeId]: MessageStateTypeId
  readonly _tag: "@effect/cluster/MessageState/Processed"
  readonly result: Option.Option<A>
}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: <A, I>(
  result: Schema.Schema<A, I, never>
) => Schema.Schema<MessageState<A>, MessageState.Encoded<I>, never>
```

Added in v1.0.0

# symbols

## MessageStateTypeId

**Signature**

```ts
export declare const MessageStateTypeId: typeof MessageStateTypeId
```

Added in v1.0.0

## MessageStateTypeId (type alias)

**Signature**

```ts
export type MessageStateTypeId = typeof MessageStateTypeId
```

Added in v1.0.0

# utils

## isMessageState

**Signature**

```ts
export declare const isMessageState: typeof internal.isMessageState
```

Added in v1.0.0

## mapEffect

**Signature**

```ts
export declare const mapEffect: <A, B, R, E>(
  value: MessageState<A>,
  fn: (value: A) => Effect.Effect<B, E, R>
) => Effect.Effect<MessageState<B>, E, R>
```

Added in v1.0.0

## match

**Signature**

```ts
export declare const match: typeof internal.match
```

Added in v1.0.0
