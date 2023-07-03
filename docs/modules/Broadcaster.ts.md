---
title: Broadcaster.ts
nav_order: 2
parent: Modules
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
export interface Broadcaster<Msg> {
  /**
   * Broadcast a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  broadcastDiscard(topic: string): (msg: Msg) => Effect.Effect<never, never, void>

  /**
   * Broadcast a message and wait for a response from each consumer
   * @since 1.0.0
   */
  broadcast<Res>(
    topic: string
  ): (
    msg: (replier: Replier.Replier<Res>) => Msg
  ) => Effect.Effect<
    never,
    never,
    HashMap.HashMap<PodAddress.PodAddress, Effect.Effect<never, ShardError.ReplyFailure, Res>>
  >
}
```

Added in v1.0.0
