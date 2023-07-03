---
title: ShardError.ts
nav_order: 20
parent: Modules
---

## ShardError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [schema](#schema)
  - [Throwable (type alias)](#throwable-type-alias)

---

# schema

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
