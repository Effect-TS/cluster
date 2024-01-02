---
title: Broadcaster.ts
nav_order: 3
parent: "@effect/cluster"
---

## Broadcaster overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [Broadcaster (interface)](#broadcaster-interface)

---

# models

## Broadcaster (interface)

An interface to communicate with a remote broadcast receiver

**Signature**

```ts
export interface Broadcaster<Msg extends Message.Any> {
  /**
   * Broadcast a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  readonly broadcastDiscard: (
    topicId: string
  ) => (message: Msg) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Broadcast a message and wait for a response from each consumer
   * @since 1.0.0
   */
  readonly broadcast: (
    topicId: string
  ) => <A extends Msg & Message.AnyWithResult>(
    message: A
  ) => Effect.Effect<
    never,
    ShardingError.ShardingError,
    HashMap.HashMap<
      PodAddress.PodAddress,
      Either.Either<ShardingError.ShardingError | Message.Failure<A>, Message.Success<A>>
    >
  >
}
```

Added in v1.0.0
