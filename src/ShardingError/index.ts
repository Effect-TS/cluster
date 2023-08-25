import * as Schema from "@effect/schema/Schema"
import { ShardingEntityNotManagedByThisPodErrorSchema } from "@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError"
import { ShardingEntityTypeNotRegisteredErrorSchema } from "@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError"
import { ShardingMessageQueueErrorSchema } from "@effect/shardcake/ShardingError/ShardingMessageQueueError"
import { ShardingPodNoLongerRegisteredErrorSchema } from "@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError"
import { ShardingPodUnavailableErrorSchema } from "@effect/shardcake/ShardingError/ShardingPodUnavailableError"
import { ShardingSendTimeoutErrorSchema } from "@effect/shardcake/ShardingError/ShardingSendTimeoutError"
import { ShardingSerializationErrorSchema } from "@effect/shardcake/ShardingError/ShardingSerializationError"

export * from "@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError"
export * from "@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError"
export * from "@effect/shardcake/ShardingError/ShardingMessageQueueError"
export * from "@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError"
export * from "@effect/shardcake/ShardingError/ShardingPodUnavailableError"
export * from "@effect/shardcake/ShardingError/ShardingSendTimeoutError"
export * from "@effect/shardcake/ShardingError/ShardingSerializationError"

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSchema = Schema.union(
  ShardingSerializationErrorSchema,
  ShardingEntityNotManagedByThisPodErrorSchema,
  ShardingEntityTypeNotRegisteredErrorSchema,
  ShardingMessageQueueErrorSchema,
  ShardingPodNoLongerRegisteredErrorSchema,
  ShardingPodUnavailableErrorSchema,
  ShardingSendTimeoutErrorSchema
)

/**
 * @since 1.0.0
 * @category models
 */
export type ShardingError = Schema.To<typeof ShardingErrorSchema>
