---
title: Messenger.ts
nav_order: 9
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
export interface Messenger<Msg extends Message.Any> {
  /**
   * Send a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  sendDiscard(entityId: string): (message: Msg) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Builds and sends a message without waiting for a response (fire and forget)
   * NOTE: This variant is considered unsafe since it creates the messageId before sending the message.
   * This means that if the message is sent, received remotely, but acknowledgmenent fails to be sent back
   * before the configured sendTimeout, if the effect is re-executed you'll end up sending multiple times the same Message.
   * @since 1.0.0
   */
  unsafeSendDiscard(
    entityId: string
  ): (message: Message.Payload<Msg>) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Send a message and wait for a response of type `Res`
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg & Message.AnyWithResult>(
    message: A
  ) => Effect.Effect<never, ShardingError.ShardingError | Message.Failure<A>, Message.Success<A>>
}
```

Added in v1.0.0
