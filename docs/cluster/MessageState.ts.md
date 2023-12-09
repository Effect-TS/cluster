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
  - [MessageStateAcknowledged](#messagestateacknowledged)
  - [MessageStateDone](#messagestatedone)
- [models](#models)
  - [MessageState (type alias)](#messagestate-type-alias)
  - [MessageStateAcknowledged (interface)](#messagestateacknowledged-interface)
  - [MessageStateDone (interface)](#messagestatedone-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [utils](#utils)
  - [isMessageStateAcknowledged](#ismessagestateacknowledged)
  - [isMessageStateDone](#ismessagestatedone)

---

# constructors

## MessageStateAcknowledged

**Signature**

```ts
export declare const MessageStateAcknowledged: MessageStateAcknowledged
```

Added in v1.0.0

## MessageStateDone

**Signature**

```ts
export declare const MessageStateDone: <A>(response: A) => MessageStateDone<A>
```

Added in v1.0.0

# models

## MessageState (type alias)

**Signature**

```ts
export type MessageState<A> = MessageStateAcknowledged | MessageStateDone<A>
```

Added in v1.0.0

## MessageStateAcknowledged (interface)

A message state given to just acknowledged messages

**Signature**

```ts
export interface MessageStateAcknowledged {
  readonly _tag: "@effect/cluster/MessageState/Acknowledged"
}
```

Added in v1.0.0

## MessageStateDone (interface)

A message state given to processed messages

**Signature**

```ts
export interface MessageStateDone<A> {
  readonly _tag: "@effect/cluster/MessageState/Done"
  readonly response: A
}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare function schema<RI, RA>(responseSchema: Schema.Schema<RI, RA>)
```

Added in v1.0.0

# utils

## isMessageStateAcknowledged

**Signature**

```ts
export declare function isMessageStateAcknowledged<A>(value: MessageState<A>): value is MessageStateDone<A>
```

Added in v1.0.0

## isMessageStateDone

**Signature**

```ts
export declare function isMessageStateDone<A>(value: MessageState<A>): value is MessageStateDone<A>
```

Added in v1.0.0
