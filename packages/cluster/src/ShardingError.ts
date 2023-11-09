/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import { ShardingErrorEntityNotManagedByThisPodSchema } from "./ShardingErrorEntityNotManagedByThisPod.js"
import { ShardingErrorEntityTypeNotRegisteredSchema } from "./ShardingErrorEntityTypeNotRegistered.js"
import { ShardingErrorMessageQueueSchema } from "./ShardingErrorMessageQueue.js"
import { ShardingErrorPodNoLongerRegisteredSchema } from "./ShardingErrorPodNoLongerRegistered.js"
import { ShardingErrorPodUnavailableSchema } from "./ShardingErrorPodUnavailable.js"
import { ShardingErrorSendTimeoutSchema } from "./ShardingErrorSendTimeout.js"
import { ShardingErrorSerializationSchema } from "./ShardingErrorSerialization.js"

/**
 * @since 1.0.0
 */
export * from "./ShardingErrorEntityNotManagedByThisPod.js"

/**
 * @since 1.0.0
 */
export * from "./ShardingErrorEntityTypeNotRegistered.js"

/**
 * @since 1.0.0
 */
export * from "./ShardingErrorMessageQueue.js"

/**
 * @since 1.0.0
 */
export * from "./ShardingErrorPodNoLongerRegistered.js"

/**
 * @since 1.0.0
 */
export * from "./ShardingErrorPodUnavailable.js"

/**
 * @since 1.0.0
 */
export * from "./ShardingErrorSendTimeout.js"

/**
 * @since 1.0.0
 */
export * from "./ShardingErrorSerialization.js"

/**
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.union(
  ShardingErrorSerializationSchema,
  ShardingErrorEntityNotManagedByThisPodSchema,
  ShardingErrorEntityTypeNotRegisteredSchema,
  ShardingErrorMessageQueueSchema,
  ShardingErrorPodNoLongerRegisteredSchema,
  ShardingErrorPodUnavailableSchema,
  ShardingErrorSendTimeoutSchema
)

/**
 * @since 1.0.0
 * @category models
 */
export type ShardingError = Schema.Schema.To<typeof schema>
