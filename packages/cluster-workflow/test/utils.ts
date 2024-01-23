import * as Activity from "@effect/cluster-workflow/Activity"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import { vi } from "vitest"
import type { Mock } from "vitest"

export function mockEffect<E, A>(
  impl: () => Exit.Exit<E, A>
): { effect: Effect.Effect<never, E, A>; spy: Mock<[], Exit.Exit<E, A>> } {
  const spy = vi.fn(impl)
  const effect = pipe(Effect.sync(spy), Effect.flatten, Effect.uninterruptible)
  return { spy, effect }
}

export function mockActivity<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  impl: () => Exit.Exit<E, A>
) {
  const { effect, spy } = mockEffect(impl)

  const activityWithBody = (fa: Effect.Effect<never, E, A>) =>
    pipe(
      effect,
      Effect.zipRight(fa),
      Activity.make(persistenceId, failure, success)
    )

  const activity = pipe(
    effect,
    Activity.make(persistenceId, failure, success)
  )

  return { spy, activity, activityWithBody }
}
