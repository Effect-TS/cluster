---
title: Message.ts
nav_order: 6
parent: "@effect/cluster"
---

## Message overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [MessageWithResult (interface)](#messagewithresult-interface)
  - [MessageWithResult (namespace)](#messagewithresult-namespace)
    - [Any (type alias)](#any-type-alias)
    - [Error (type alias)](#error-type-alias)
    - [Exit (type alias)](#exit-type-alias)
    - [Success (type alias)](#success-type-alias)
- [utils](#utils)
  - [exitSchema](#exitschema)
  - [isMessageWithResult](#ismessagewithresult)

---

# models

## MessageWithResult (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface MessageWithResult<Failure, Success>
  extends Serializable.WithResult<never, any, Failure, any, Success> {}
```

Added in v1.0.0

## MessageWithResult (namespace)

Added in v1.0.0

### Any (type alias)

**Signature**

```ts
export type Any =
  | Serializable.WithResult<never, never, never, any, any>
  | Serializable.WithResult<never, any, any, any, any>
```

Added in v1.0.0

### Error (type alias)

Extracts the success type from a `MessageWithResult<A, S>`.

**Signature**

```ts
export type Error<S> = S extends MessageWithResult<infer X, any> ? X : never
```

Added in v1.0.0

### Exit (type alias)

Extracts the success type from a `MessageWithResult<A, S>`.

**Signature**

```ts
export type Exit<S> = S extends Serializable.WithResult<never, any, infer E, any, infer A>
  ? Exit_.Exit<A, E>
  : S extends Serializable.WithResult<never, never, infer E, any, infer A>
  ? Exit_.Exit<A, E>
  : never
```

Added in v1.0.0

### Success (type alias)

Extracts the success type from a `MessageWithResult<A, S>`.

**Signature**

```ts
export type Success<S> = S extends MessageWithResult<any, infer X> ? X : never
```

Added in v1.0.0

# utils

## exitSchema

**Signature**

```ts
export declare const exitSchema: <A extends MessageWithResult.Any>(
  message: A
) => Schema.Schema<MessageWithResult.Exit<A>, unknown, never>
```

Added in v1.0.0

## isMessageWithResult

**Signature**

```ts
export declare const isMessageWithResult: (value: unknown) => value is MessageWithResult<unknown, unknown>
```

Added in v1.0.0
