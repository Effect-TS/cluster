---
title: ShardError.ts
nav_order: 22
parent: Modules
---

## ShardError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [DecodeError](#decodeerror)
  - [EncodeError](#encodeerror)
  - [EntityNotManagedByThisPod](#entitynotmanagedbythispod)
  - [EntityTypeNotRegistered](#entitytypenotregistered)
  - [FetchError](#fetcherror)
  - [MessageReturnedNoting](#messagereturnednoting)
  - [NotAMessageWithReplier](#notamessagewithreplier)
  - [PodNoLongerRegistered](#podnolongerregistered)
  - [PodUnavailable](#podunavailable)
  - [ReplyFailure](#replyfailure)
  - [SendError](#senderror)
  - [SendTimeoutException](#sendtimeoutexception)
  - [isEntityTypeNotRegistered](#isentitytypenotregistered)
- [models](#models)
  - [DecodeError (interface)](#decodeerror-interface)
  - [EncodeError (interface)](#encodeerror-interface)
  - [EntityNotManagedByThisPod (interface)](#entitynotmanagedbythispod-interface)
  - [EntityTypeNotRegistered (interface)](#entitytypenotregistered-interface)
  - [FetchError (interface)](#fetcherror-interface)
  - [MessageReturnedNoting (interface)](#messagereturnednoting-interface)
  - [NotAMessageWithReplier (interface)](#notamessagewithreplier-interface)
  - [PodNoLongerRegistered (interface)](#podnolongerregistered-interface)
  - [PodUnavailable (interface)](#podunavailable-interface)
  - [ReplyFailure (interface)](#replyfailure-interface)
  - [SendError (interface)](#senderror-interface)
  - [SendTimeoutException (interface)](#sendtimeoutexception-interface)
- [schema](#schema)
  - [EntityTypeNotRegistered\_](#entitytypenotregistered_)
  - [Throwable (type alias)](#throwable-type-alias)
- [utils](#utils)
  - [isEntityNotManagedByThisPodError](#isentitynotmanagedbythispoderror)
  - [isFetchError](#isfetcherror)
  - [isPodUnavailableError](#ispodunavailableerror)

---

# constructors

## DecodeError

**Signature**

```ts
export declare function DecodeError(error: unknown): DecodeError
```

Added in v1.0.0

## EncodeError

**Signature**

```ts
export declare function EncodeError(error: unknown): EncodeError
```

Added in v1.0.0

## EntityNotManagedByThisPod

**Signature**

```ts
export declare function EntityNotManagedByThisPod(entityId: string): EntityNotManagedByThisPod
```

Added in v1.0.0

## EntityTypeNotRegistered

**Signature**

```ts
export declare function EntityTypeNotRegistered(
  entityType: string,
  podAddress: PodAddress.PodAddress
): EntityTypeNotRegistered
```

Added in v1.0.0

## FetchError

**Signature**

```ts
export declare function FetchError(url: string, body: string, error: unknown): FetchError
```

Added in v1.0.0

## MessageReturnedNoting

**Signature**

```ts
export declare function MessageReturnedNoting<A>(entityId: string, msg: A): MessageReturnedNoting
```

Added in v1.0.0

## NotAMessageWithReplier

**Signature**

```ts
export declare function NotAMessageWithReplier(value: unknown)
```

Added in v1.0.0

## PodNoLongerRegistered

**Signature**

```ts
export declare function PodNoLongerRegistered(pod: PodAddress.PodAddress): PodNoLongerRegistered
```

Added in v1.0.0

## PodUnavailable

**Signature**

```ts
export declare function PodUnavailable(pod: PodAddress.PodAddress): PodUnavailable
```

Added in v1.0.0

## ReplyFailure

**Signature**

```ts
export declare function ReplyFailure(error: unknown): ReplyFailure
```

Added in v1.0.0

## SendError

**Signature**

```ts
export declare function SendError(): SendError
```

Added in v1.0.0

## SendTimeoutException

**Signature**

```ts
export declare function SendTimeoutException<A>(
  entityType: RecipentType.RecipientType<A>,
  entityId: String,
  body: A
): SendTimeoutException<A>
```

Added in v1.0.0

## isEntityTypeNotRegistered

**Signature**

```ts
export declare function isEntityTypeNotRegistered(value: unknown): value is EntityTypeNotRegistered
```

Added in v1.0.0

# models

## DecodeError (interface)

**Signature**

```ts
export interface DecodeError {
  _tag: 'DecodeError'
  error: unknown
}
```

Added in v1.0.0

## EncodeError (interface)

**Signature**

```ts
export interface EncodeError {
  _tag: 'EncodeError'
  error: unknown
}
```

Added in v1.0.0

## EntityNotManagedByThisPod (interface)

**Signature**

```ts
export interface EntityNotManagedByThisPod {
  _tag: 'EntityNotManagedByThisPod'
  entityId: string
}
```

Added in v1.0.0

## EntityTypeNotRegistered (interface)

**Signature**

```ts
export interface EntityTypeNotRegistered extends Schema.To<typeof EntityTypeNotRegistered_> {}
```

Added in v1.0.0

## FetchError (interface)

**Signature**

```ts
export interface FetchError {
  _tag: '@effect/shardcake/FetchError'
  url: string
  body: string
  error: unknown
}
```

Added in v1.0.0

## MessageReturnedNoting (interface)

**Signature**

```ts
export interface MessageReturnedNoting {
  _tag: 'MessageReturnedNoting'
  entityId: string
  msg: any
}
```

Added in v1.0.0

## NotAMessageWithReplier (interface)

**Signature**

```ts
export interface NotAMessageWithReplier {
  _tag: 'NotAMessageWithReplier'
  value: unknown
}
```

Added in v1.0.0

## PodNoLongerRegistered (interface)

**Signature**

```ts
export interface PodNoLongerRegistered {
  _tag: 'PodNoLongerRegistered'
  pod: PodAddress.PodAddress
}
```

Added in v1.0.0

## PodUnavailable (interface)

**Signature**

```ts
export interface PodUnavailable {
  _tag: 'PodUnavailable'
  pod: PodAddress.PodAddress
}
```

Added in v1.0.0

## ReplyFailure (interface)

**Signature**

```ts
export interface ReplyFailure {
  _tag: 'ReplyFailure'
  error: unknown
}
```

Added in v1.0.0

## SendError (interface)

**Signature**

```ts
export interface SendError {
  _tag: 'SendError'
}
```

Added in v1.0.0

## SendTimeoutException (interface)

**Signature**

```ts
export interface SendTimeoutException<A> {
  _tag: 'SendTimeoutException'
  entityType: RecipentType.RecipientType<A>
  entityId: String
  body: A
}
```

Added in v1.0.0

# schema

## EntityTypeNotRegistered\_

**Signature**

```ts
export declare const EntityTypeNotRegistered_: Schema.Schema<
  {
    readonly entityType: string
    readonly _tag: 'EntityTypeNotRegistered'
    readonly podAddress: { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }
  },
  {
    readonly entityType: string
    readonly _tag: 'EntityTypeNotRegistered'
    readonly podAddress: Data<{
      readonly _id: '@effect/shardcake/PodAddress'
      readonly host: string
      readonly port: number
    }>
  }
>
```

Added in v1.0.0

## Throwable (type alias)

**Signature**

```ts
export type Throwable =
  | DecodeError
  | EncodeError
  | ReplyFailure
  | SendError
  | SendTimeoutException<any>
  | EntityNotManagedByThisPod
  | PodUnavailable
  | EntityTypeNotRegistered
  | MessageReturnedNoting
  | PodNoLongerRegistered
  | FetchError
```

Added in v1.0.0

# utils

## isEntityNotManagedByThisPodError

**Signature**

```ts
export declare function isEntityNotManagedByThisPodError(value: any): value is EntityNotManagedByThisPod
```

Added in v1.0.0

## isFetchError

**Signature**

```ts
export declare function isFetchError(value: unknown): value is FetchError
```

Added in v1.0.0

## isPodUnavailableError

**Signature**

```ts
export declare function isPodUnavailableError(value: any): value is PodUnavailable
```

Added in v1.0.0
