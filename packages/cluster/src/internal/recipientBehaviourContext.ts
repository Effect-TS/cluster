import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import type * as RecipientBehaviourContext from "../RecipientBehaviourContext.js"

/** @internal */
const RecipientBehaviourContextSymbolKey = "@effect/cluster/RecipientBehaviourContext"

/** @internal */
export const RecipientBehaviourContextTypeId: RecipientBehaviourContext.RecipientBehaviourContextTypeId = Symbol.for(
  RecipientBehaviourContextSymbolKey
) as RecipientBehaviourContext.RecipientBehaviourContextTypeId

/** @internal */
export const recipientBehaviourContextTag = Context.Tag<RecipientBehaviourContext.RecipientBehaviourContext>(
  RecipientBehaviourContextSymbolKey
)

/** @internal */
export function make(
  args: Omit<
    RecipientBehaviourContext.RecipientBehaviourContext,
    RecipientBehaviourContext.RecipientBehaviourContextTypeId
  >
): RecipientBehaviourContext.RecipientBehaviourContext {
  return ({ [RecipientBehaviourContextTypeId]: RecipientBehaviourContextTypeId, ...args })
}

/** @internal */
export const entityId: Effect.Effect<RecipientBehaviourContext.RecipientBehaviourContext, never, string> = Effect.map(
  recipientBehaviourContextTag,
  (_) => _.entityId
)

/** @internal */
export const forkShutdown: Effect.Effect<RecipientBehaviourContext.RecipientBehaviourContext, never, void> = Effect
  .flatMap(
    recipientBehaviourContextTag,
    (_) => _.forkShutdown
  )
