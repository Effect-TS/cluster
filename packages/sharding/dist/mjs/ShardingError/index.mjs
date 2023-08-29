/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import { ShardingEntityNotManagedByThisPodErrorSchema } from "@effect/sharding/ShardingError/ShardingEntityNotManagedByThisPodError";
import { ShardingEntityTypeNotRegisteredErrorSchema } from "@effect/sharding/ShardingError/ShardingEntityTypeNotRegisteredError";
import { ShardingMessageQueueErrorSchema } from "@effect/sharding/ShardingError/ShardingMessageQueueError";
import { ShardingPodNoLongerRegisteredErrorSchema } from "@effect/sharding/ShardingError/ShardingPodNoLongerRegisteredError";
import { ShardingPodUnavailableErrorSchema } from "@effect/sharding/ShardingError/ShardingPodUnavailableError";
import { ShardingSendTimeoutErrorSchema } from "@effect/sharding/ShardingError/ShardingSendTimeoutError";
import { ShardingSerializationErrorSchema } from "@effect/sharding/ShardingError/ShardingSerializationError";
export * from "@effect/sharding/ShardingError/ShardingEntityNotManagedByThisPodError";
export * from "@effect/sharding/ShardingError/ShardingEntityTypeNotRegisteredError";
export * from "@effect/sharding/ShardingError/ShardingMessageQueueError";
export * from "@effect/sharding/ShardingError/ShardingPodNoLongerRegisteredError";
export * from "@effect/sharding/ShardingError/ShardingPodUnavailableError";
export * from "@effect/sharding/ShardingError/ShardingSendTimeoutError";
export * from "@effect/sharding/ShardingError/ShardingSerializationError";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSchema = /*#__PURE__*/Schema.union(ShardingSerializationErrorSchema, ShardingEntityNotManagedByThisPodErrorSchema, ShardingEntityTypeNotRegisteredErrorSchema, ShardingMessageQueueErrorSchema, ShardingPodNoLongerRegisteredErrorSchema, ShardingPodUnavailableErrorSchema, ShardingSendTimeoutErrorSchema);
//# sourceMappingURL=index.mjs.map