import type { Schema } from "@effect/schema"
import type { Effect } from "effect"

export interface DurableTimer {
  upsert<I, A>(persistenceId: string, schema: Schema.Schema<I, A>, value: A): Effect.Effect<never, never, void>
  clear(persistenceId: string): Effect.Effect<never, never, void>
}
