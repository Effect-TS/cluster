---
title: StreamMessage.ts
nav_order: 48
parent: Modules
---

## StreamMessage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [StreamMessage (interface)](#streammessage-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [utils](#utils)
  - [Success (type alias)](#success-type-alias)
  - [isStreamMessage](#isstreammessage)

---

# models

## StreamMessage (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface StreamMessage<A> {
  readonly replier: StreamReplier.StreamReplier<A>
}
```

Added in v1.0.0

# schema

## schema

Creates both the schema and a constructor for a `Message<A>`

**Signature**

```ts
export declare function schema<RI, RA>(success: Schema.Schema<RI, RA>)
```

Added in v1.0.0

# utils

## Success (type alias)

Extracts the success type from a `Message<A>`.

**Signature**

```ts
export type Success<A> = A extends StreamMessage<infer X> ? X : never
```

Added in v1.0.0

## isStreamMessage

**Signature**

```ts
export declare function isStreamMessage<A>(value: unknown): value is StreamMessage<A>
```

Added in v1.0.0
