/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import { ShardingErrorEntityNotManagedByThisPodSchema } from "@effect/sharding/ShardingErrorEntityNotManagedByThisPod";
import { ShardingErrorEntityTypeNotRegisteredSchema } from "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
import { ShardingErrorMessageQueueSchema } from "@effect/sharding/ShardingErrorMessageQueue";
import { ShardingErrorPodNoLongerRegisteredSchema } from "@effect/sharding/ShardingErrorPodNoLongerRegistered";
import { ShardingErrorPodUnavailableSchema } from "@effect/sharding/ShardingErrorPodUnavailable";
import { ShardingErrorSendTimeoutSchema } from "@effect/sharding/ShardingErrorSendTimeout";
import { ShardingErrorSerializationSchema } from "@effect/sharding/ShardingErrorSerialization";
export * from "@effect/sharding/ShardingErrorEntityNotManagedByThisPod";
export * from "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
export * from "@effect/sharding/ShardingErrorMessageQueue";
export * from "@effect/sharding/ShardingErrorPodNoLongerRegistered";
export * from "@effect/sharding/ShardingErrorPodUnavailable";
export * from "@effect/sharding/ShardingErrorSendTimeout";
export * from "@effect/sharding/ShardingErrorSerialization";
/**
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.union(ShardingErrorSerializationSchema, ShardingErrorEntityNotManagedByThisPodSchema, ShardingErrorEntityTypeNotRegisteredSchema, ShardingErrorMessageQueueSchema, ShardingErrorPodNoLongerRegisteredSchema, ShardingErrorPodUnavailableSchema, ShardingErrorSendTimeoutSchema);
//# sourceMappingURL=ShardingError.mjs.map