---
title: Messenger.ts
nav_order: 8
parent: Modules
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
export interface Messenger<Msg> {
  /**
   * Send a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  sendDiscard(entityId: string): (msg: Msg) => Effect.Effect<never, Throwable, void>

  /**
   * Send a message and wait for a response of type `Res`
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg & Message.Message<any>>(
    msg: (replyId: ReplyId.ReplyId) => A
  ) => Effect.Effect<never, Throwable, Message.Success<A>>
}
```

Added in v1.0.0
