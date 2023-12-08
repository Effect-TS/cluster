import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type * as Pods from "../Pods.js"
import * as ReplyId from "../ReplyId.js"

/** @internal */
const PodsSymbolKey = "@effect/cluster/Pods"

/** @internal */
export const PodsTypeId: Pods.PodsTypeId = Symbol.for(PodsSymbolKey) as Pods.PodsTypeId

/** @internal */
export const podsTag = Context.Tag<Pods.Pods>()

/** @internal */
export function make(
  args: Omit<Pods.Pods, Pods.PodsTypeId>
): Pods.Pods {
  return { [PodsTypeId]: PodsTypeId, ...args }
}

/** @internal */
export const noop = Layer.succeed(podsTag, {
  [PodsTypeId]: PodsTypeId,
  assignShards: () => Effect.unit,
  unassignShards: () => Effect.unit,
  ping: () => Effect.unit,
  sendMessage: () => ReplyId.makeEffect,
  pullReply: () => Effect.never
})
