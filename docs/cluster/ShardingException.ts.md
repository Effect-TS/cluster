---
title: ShardingException.ts
nav_order: 24
parent: "@effect/cluster"
---

## ShardingException overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [EntityNotManagedByThisPodException (class)](#entitynotmanagedbythispodexception-class)
  - [EntityTypeNotRegisteredException (class)](#entitytypenotregisteredexception-class)
  - [ExceptionWhileOfferingMessageException (class)](#exceptionwhileofferingmessageexception-class)
  - [NoResultInProcessedMessageStateException (class)](#noresultinprocessedmessagestateexception-class)
  - [PodNoLongerRegisteredException (class)](#podnolongerregisteredexception-class)
  - [PodUnavailableException (class)](#podunavailableexception-class)
  - [SendTimeoutException (class)](#sendtimeoutexception-class)
  - [SerializationException (class)](#serializationexception-class)
  - [ShardingException (type alias)](#shardingexception-type-alias)
- [schema](#schema)
  - [schema](#schema-1)
- [utils](#utils)
  - [isEntityNotManagedByThisPodException](#isentitynotmanagedbythispodexception)
  - [isEntityTypeNotRegisteredException](#isentitytypenotregisteredexception)
  - [isExceptionWhileOfferingMessageException](#isexceptionwhileofferingmessageexception)
  - [isNoResultInProcessedMessageStateException](#isnoresultinprocessedmessagestateexception)
  - [isPodNoLongerRegisteredException](#ispodnolongerregisteredexception)
  - [isPodUnavailableException](#ispodunavailableexception)
  - [isSendTimeoutException](#issendtimeoutexception)
  - [isSerializationException](#isserializationexception)

---

# models

## EntityNotManagedByThisPodException (class)

**Signature**

```ts
export declare class EntityNotManagedByThisPodException
```

Added in v1.0.0

## EntityTypeNotRegisteredException (class)

**Signature**

```ts
export declare class EntityTypeNotRegisteredException
```

Added in v1.0.0

## ExceptionWhileOfferingMessageException (class)

**Signature**

```ts
export declare class ExceptionWhileOfferingMessageException
```

Added in v1.0.0

## NoResultInProcessedMessageStateException (class)

**Signature**

```ts
export declare class NoResultInProcessedMessageStateException
```

Added in v1.0.0

## PodNoLongerRegisteredException (class)

**Signature**

```ts
export declare class PodNoLongerRegisteredException
```

Added in v1.0.0

## PodUnavailableException (class)

**Signature**

```ts
export declare class PodUnavailableException
```

Added in v1.0.0

## SendTimeoutException (class)

**Signature**

```ts
export declare class SendTimeoutException
```

Added in v1.0.0

## SerializationException (class)

**Signature**

```ts
export declare class SerializationException
```

Added in v1.0.0

## ShardingException (type alias)

**Signature**

```ts
export type ShardingException = Schema.Schema.Type<typeof schema>
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: Schema.union<
  [
    typeof SerializationException,
    typeof EntityNotManagedByThisPodException,
    typeof EntityTypeNotRegisteredException,
    typeof PodNoLongerRegisteredException,
    typeof PodUnavailableException,
    typeof SendTimeoutException,
    typeof NoResultInProcessedMessageStateException,
    typeof ExceptionWhileOfferingMessageException
  ]
>
```

Added in v1.0.0

# utils

## isEntityNotManagedByThisPodException

**Signature**

```ts
export declare const isEntityNotManagedByThisPodException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is EntityNotManagedByThisPodException
```

Added in v1.0.0

## isEntityTypeNotRegisteredException

**Signature**

```ts
export declare const isEntityTypeNotRegisteredException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is EntityTypeNotRegisteredException
```

Added in v1.0.0

## isExceptionWhileOfferingMessageException

**Signature**

```ts
export declare const isExceptionWhileOfferingMessageException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is ExceptionWhileOfferingMessageException
```

Added in v1.0.0

## isNoResultInProcessedMessageStateException

**Signature**

```ts
export declare const isNoResultInProcessedMessageStateException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is NoResultInProcessedMessageStateException
```

Added in v1.0.0

## isPodNoLongerRegisteredException

**Signature**

```ts
export declare const isPodNoLongerRegisteredException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is PodNoLongerRegisteredException
```

Added in v1.0.0

## isPodUnavailableException

**Signature**

```ts
export declare const isPodUnavailableException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is PodUnavailableException
```

Added in v1.0.0

## isSendTimeoutException

**Signature**

```ts
export declare const isSendTimeoutException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is SendTimeoutException
```

Added in v1.0.0

## isSerializationException

**Signature**

```ts
export declare const isSerializationException: (
  u: unknown,
  overrideOptions?: ParseOptions | undefined
) => u is SerializationException
```

Added in v1.0.0
