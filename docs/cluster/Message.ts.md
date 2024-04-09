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
  - [Message (interface)](#message-interface)
  - [Message (namespace)](#message-namespace)
    - [Any (type alias)](#any-type-alias)
    - [Error (type alias)](#error-type-alias)
    - [Exit (type alias)](#exit-type-alias)
    - [Success (type alias)](#success-type-alias)
- [schemas](#schemas)
  - [TaggedMessage](#taggedmessage)
  - [TaggedMessageConstructor (interface)](#taggedmessageconstructor-interface)
- [utils](#utils)
  - [exitSchema](#exitschema)
  - [isMessageWithResult](#ismessagewithresult)

---

# models

## Message (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface Message<A, AI, E, EI>
  extends Serializable.SerializableWithResult<any, any, never, A, AI, E, EI, never>,
    PrimaryKey.PrimaryKey {}
```

Added in v1.0.0

## Message (namespace)

Added in v1.0.0

### Any (type alias)

**Signature**

```ts
export type Any = Message<any, any, any, any> | Message<any, any, never, never>
```

Added in v1.0.0

### Error (type alias)

Extracts the success type from a `MessageWithResult<A, E>`.

**Signature**

```ts
export type Error<S> = S extends Message<infer _A, infer _AI, infer E, infer _EI> ? E : never
```

Added in v1.0.0

### Exit (type alias)

Extracts the success type from a `MessageWithResult<A, E>`.

**Signature**

```ts
export type Exit<S> =
  S extends Serializable.WithResult<infer A, infer _AI, infer E, infer _EI, infer _R> ? Exit_.Exit<A, E> : never
```

Added in v1.0.0

### Success (type alias)

Extracts the success type from a `MessageWithResult<A, E>`.

**Signature**

```ts
export type Success<S> = S extends Message<infer A, infer _AI, infer _E, infer _EI> ? A : never
```

Added in v1.0.0

# schemas

## TaggedMessage

**Signature**

```ts
export declare const TaggedMessage: <Self>() => <Tag extends string, E, IE, A, IA, Fields extends Schema.Struct.Fields>(
  tag: Tag,
  failure: Schema.Schema<E, IE, never>,
  success: Schema.Schema<A, IA, never>,
  fields: Fields,
  messageToId: (message: Schema.Struct.Encoded<Fields>) => string
) => TaggedMessageConstructor<
  Tag,
  Self,
  Schema.Schema.Context<Fields[keyof Fields]>,
  Types.Simplify<Schema.Struct.Encoded<Fields>>,
  Types.Simplify<Schema.Struct.Type<Fields>>,
  IE,
  E,
  IA,
  A
>
```

Added in v1.0.0

## TaggedMessageConstructor (interface)

**Signature**

```ts
export interface TaggedMessageConstructor<Tag extends string, Self, R, IS, S, IE, E, IA, A>
  extends Schema.Schema<Self, Types.Simplify<IS & { readonly _tag: Tag }>, R> {
  new (
    props: Types.Equals<S, {}> extends true ? void : S,
    disableValidation?: boolean
  ): Schema.TaggedRequest<Tag, S, IS & { readonly _tag: Tag }, never, A, IA, E, IE, never> & S & PrimaryKey.PrimaryKey
}
```

Added in v1.0.0

# utils

## exitSchema

**Signature**

```ts
export declare const exitSchema: <A extends Message.Any>(message: A) => Schema.Schema<Message.Exit<A>, unknown, never>
```

Added in v1.0.0

## isMessageWithResult

**Signature**

```ts
export declare const isMessageWithResult: (value: unknown) => value is Message<unknown, unknown, unknown, unknown>
```

Added in v1.0.0
