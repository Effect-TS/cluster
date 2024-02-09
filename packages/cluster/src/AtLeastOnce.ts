/**
 * @since 1.0.0
 */
import type * as Duration from "effect/Duration"
import type * as Effect from "effect/Effect"
import type * as Scope from "effect/Scope"
import type * as AtLeastOnceStorage from "./AtLeastOnceStorage.js"
import * as internal from "./internal/atLeastOnce.js"
import type * as RecipientBehaviour from "./RecipientBehaviour.js"
import type * as Sharding from "./Sharding.js"

/**
 * @since 1.0.0
 * @category constructors
 */
export const atLeastOnceRecipientBehaviour: <R, Msg>(
  fa: RecipientBehaviour.RecipientBehaviour<R, Msg>
) => RecipientBehaviour.RecipientBehaviour<R | AtLeastOnceStorage.AtLeastOnceStorage, Msg> =
  internal.atLeastOnceRecipientBehaviour

/**
 * @since 1.0.0
 * @category utils
 */
export const runPendingMessageSweeperScoped: (
  interval: Duration.Duration
) => Effect.Effect<void, never, AtLeastOnceStorage.AtLeastOnceStorage | Sharding.Sharding | Scope.Scope> =
  internal.runPendingMessageSweeperScoped
