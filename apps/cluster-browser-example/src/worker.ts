import * as T from "@effect/cluster-browser/RpcBroadcastChannel"

import { Resolver } from "@effect/rpc"
import { Console, Effect, Stream } from "effect"
import type { UserRouter } from "./router.js"
import { GetUser, GetUserIds } from "./schema.js"

// Create the client

const client = T.make<UserRouter>("my-rpc").pipe(Resolver.toClient)

// Use the client
client(new GetUserIds()).pipe(
  Stream.runCollect,
  Effect.flatMap(Effect.forEach((id) => client(new GetUser({ id })), { batching: true })),
  Effect.tap(Console.log),
  Effect.catchAllCause(Effect.log),
  Effect.runFork
)
