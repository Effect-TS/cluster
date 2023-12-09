---
title: PodsHealth.ts
nav_order: 11
parent: "@effect/cluster"
---

## PodsHealth overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [context](#context)
  - [PodsHealth](#podshealth)
- [layers](#layers)
  - [local](#local)
  - [noop](#noop)
- [models](#models)
  - [PodsHealth (interface)](#podshealth-interface)
- [symbols](#symbols)
  - [PodsHealthTypeId](#podshealthtypeid)
  - [PodsHealthTypeId (type alias)](#podshealthtypeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare const make: (args: Omit<PodsHealth, typeof PodsHealthTypeId>) => PodsHealth
```

Added in v1.0.0

# context

## PodsHealth

**Signature**

```ts
export declare const PodsHealth: Context.Tag<PodsHealth, PodsHealth>
```

Added in v1.0.0

# layers

## local

A layer that pings the pod directly to check if it's alive.
This is useful for developing and testing but not reliable in production.

**Signature**

```ts
export declare const local: Layer.Layer<Pods.Pods, never, PodsHealth>
```

Added in v1.0.0

## noop

A layer that considers pods as always alive.
This is useful for testing only.

**Signature**

```ts
export declare const noop: Layer.Layer<never, never, PodsHealth>
```

Added in v1.0.0

# models

## PodsHealth (interface)

An interface to check a pod's health.
This is used when a pod is unresponsive, to check if it should be unassigned all its shards or not.
If the pod is alive, shards will not be unassigned because the pods might still be processing messages and might be responsive again.
If the pod is not alive, shards can be safely reassigned somewhere else.
A typical implementation for this is using k8s to check if the pod still exists.

**Signature**

```ts
export interface PodsHealth {
  /**
   * @since 1.0.0
   */
  readonly [PodsHealthTypeId]: PodsHealthTypeId

  /**
   * Check if a pod is still alive.
   * @since 1.0.0
   */
  readonly isAlive: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, boolean>
}
```

Added in v1.0.0

# symbols

## PodsHealthTypeId

**Signature**

```ts
export declare const PodsHealthTypeId: typeof PodsHealthTypeId
```

Added in v1.0.0

## PodsHealthTypeId (type alias)

**Signature**

```ts
export type PodsHealthTypeId = typeof PodsHealthTypeId
```

Added in v1.0.0
