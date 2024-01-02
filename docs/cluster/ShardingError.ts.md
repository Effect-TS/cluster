---
title: ShardingError.ts
nav_order: 24
parent: "@effect/cluster"
---

## ShardingError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [exports](#exports)
  - [From "./ShardingErrorEntityNotManagedByThisPod.js"](#from-shardingerrorentitynotmanagedbythispodjs)
  - [From "./ShardingErrorEntityTypeNotRegistered.js"](#from-shardingerrorentitytypenotregisteredjs)
  - [From "./ShardingErrorNoResultInMessageProcessedState.js"](#from-shardingerrornoresultinmessageprocessedstatejs)
  - [From "./ShardingErrorPodNoLongerRegistered.js"](#from-shardingerrorpodnolongerregisteredjs)
  - [From "./ShardingErrorPodUnavailable.js"](#from-shardingerrorpodunavailablejs)
  - [From "./ShardingErrorSendTimeout.js"](#from-shardingerrorsendtimeoutjs)
  - [From "./ShardingErrorSerialization.js"](#from-shardingerrorserializationjs)
  - [From "./ShardingErrorWhileOfferingMessage.js"](#from-shardingerrorwhileofferingmessagejs)
- [models](#models)
  - [ShardingError (type alias)](#shardingerror-type-alias)
- [schema](#schema)
  - [schema](#schema-1)

---

# exports

## From "./ShardingErrorEntityNotManagedByThisPod.js"

Re-exports all named exports from the "./ShardingErrorEntityNotManagedByThisPod.js" module.

**Signature**

```ts
export * from "./ShardingErrorEntityNotManagedByThisPod.js"
```

Added in v1.0.0

## From "./ShardingErrorEntityTypeNotRegistered.js"

Re-exports all named exports from the "./ShardingErrorEntityTypeNotRegistered.js" module.

**Signature**

```ts
export * from "./ShardingErrorEntityTypeNotRegistered.js"
```

Added in v1.0.0

## From "./ShardingErrorNoResultInMessageProcessedState.js"

Re-exports all named exports from the "./ShardingErrorNoResultInMessageProcessedState.js" module.

**Signature**

```ts
export * from "./ShardingErrorNoResultInMessageProcessedState.js"
```

Added in v1.0.0

## From "./ShardingErrorPodNoLongerRegistered.js"

Re-exports all named exports from the "./ShardingErrorPodNoLongerRegistered.js" module.

**Signature**

```ts
export * from "./ShardingErrorPodNoLongerRegistered.js"
```

Added in v1.0.0

## From "./ShardingErrorPodUnavailable.js"

Re-exports all named exports from the "./ShardingErrorPodUnavailable.js" module.

**Signature**

```ts
export * from "./ShardingErrorPodUnavailable.js"
```

Added in v1.0.0

## From "./ShardingErrorSendTimeout.js"

Re-exports all named exports from the "./ShardingErrorSendTimeout.js" module.

**Signature**

```ts
export * from "./ShardingErrorSendTimeout.js"
```

Added in v1.0.0

## From "./ShardingErrorSerialization.js"

Re-exports all named exports from the "./ShardingErrorSerialization.js" module.

**Signature**

```ts
export * from "./ShardingErrorSerialization.js"
```

Added in v1.0.0

## From "./ShardingErrorWhileOfferingMessage.js"

Re-exports all named exports from the "./ShardingErrorWhileOfferingMessage.js" module.

**Signature**

```ts
export * from "./ShardingErrorWhileOfferingMessage.js"
```

Added in v1.0.0

# models

## ShardingError (type alias)

**Signature**

```ts
export type ShardingError = Schema.Schema.To<typeof schema>
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: Schema.Schema<
  | { readonly _tag: "./ShardingErrorWhileOfferingMessage"; readonly error: string }
  | { readonly _tag: "./ShardingErrorSerialization"; readonly error: string }
  | { readonly _tag: "./ShardingErrorSendTimeout" }
  | { readonly _tag: "./ShardingErrorPodUnavailable"; readonly pod: PodAddress.From }
  | { readonly _tag: "./ShardingErrorPodNoLongerRegistered"; readonly podAddress: PodAddress.From }
  | { readonly _tag: "./ShardingErrorNoResultInProcessedMessageState" }
  | {
      readonly _tag: "./ShardingErrorEntityTypeNotRegistered"
      readonly podAddress: PodAddress.From
      readonly entityType: string
    }
  | { readonly _tag: "./ShardingErrorEntityNotManagedByThisPod"; readonly entityId: string },
  | ShardingErrorWhileOfferingMessage
  | ShardingErrorSerialization
  | ShardingErrorSendTimeout
  | ShardingErrorPodUnavailable
  | ShardingErrorPodNoLongerRegistered
  | ShardingErrorNoResultInProcessedMessageState
  | ShardingErrorEntityTypeNotRegistered
  | ShardingErrorEntityNotManagedByThisPod
>
```

Added in v1.0.0
