
import { Router, Rpc } from "@effect/rpc"
import * as T from "@effect/cluster-browser/RpcBroadcastChannel"
import { Effect, ReadonlyArray, Stream, pipe } from "effect"
import { GetUser, GetUserIds, User, UserId } from "./schema.js"

// Implement the RPC server router
const router = Router.make(
  Rpc.stream(GetUserIds, () => Stream.fromIterable(ReadonlyArray.makeBy(10, UserId))),
  Rpc.effect(GetUser, ({ id }) => Effect.succeed(new User({ id, name: "John Doe" })))
)

export type UserRouter = typeof router


Effect.runPromise(
    pipe(
        T.toBroadcastChannelRouter(router, "my-rpc"),
        Effect.zipRight(Effect.never),
        Effect.scoped
    )
)
