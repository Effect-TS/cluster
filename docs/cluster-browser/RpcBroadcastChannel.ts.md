---
title: RpcBroadcastChannel.ts
nav_order: 2
parent: "@effect/cluster-browser"
---

## RpcBroadcastChannel overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [make](#make)
  - [toBroadcastChannelRouter](#tobroadcastchannelrouter)

---

# utils

## make

**Signature**

```ts
export declare const make: <R extends Router.Router<any, any>>(
  channelId: string
) => RequestResolver.RequestResolver<
  Rpc.Request<Router.Router.Request<R>>,
  Serializable.SerializableWithResult.Context<Router.Router.Request<R>>
>
```

Added in v1.0.0

## toBroadcastChannelRouter

**Signature**

```ts
export declare const toBroadcastChannelRouter: <R extends Router.Router<any, any>>(
  self: R,
  channelId: string
) => Effect.Effect<RuntimeFiber<void, ParseError>, never, Scope>
```

Added in v1.0.0
