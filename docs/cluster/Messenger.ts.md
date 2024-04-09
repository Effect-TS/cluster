---
title: Messenger.ts
nav_order: 8
parent: "@effect/cluster"
---

## Messenger overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [Messenger (interface)](#messenger-interface)

---

# models

## Messenger (interface)

An interface to communicate with a remote entity

**Signature**

```ts
export interface Messenger<Msg extends Message.Message.Any> {
  /**
   * Send a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  sendDiscard(entityId: string): (message: Msg) => Effect.Effect<void, ShardingException.ShardingException>

  /**
   * Send a message and wait for a response of type `Res`
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg>(
    message: A
  ) => Effect.Effect<Message.Message.Success<A>, ShardingException.ShardingException | Message.Message.Error<A>>
}
```

Added in v1.0.0
