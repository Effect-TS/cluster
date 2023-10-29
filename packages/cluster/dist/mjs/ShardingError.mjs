/**
 * @since 1.0.0
 */
import { ShardingErrorEntityNotManagedByThisPodSchema } from "@effect/cluster/ShardingErrorEntityNotManagedByThisPod";
import { ShardingErrorEntityTypeNotRegisteredSchema } from "@effect/cluster/ShardingErrorEntityTypeNotRegistered";
import { ShardingErrorMessageQueueSchema } from "@effect/cluster/ShardingErrorMessageQueue";
import { ShardingErrorPodNoLongerRegisteredSchema } from "@effect/cluster/ShardingErrorPodNoLongerRegistered";
import { ShardingErrorPodUnavailableSchema } from "@effect/cluster/ShardingErrorPodUnavailable";
import { ShardingErrorSendTimeoutSchema } from "@effect/cluster/ShardingErrorSendTimeout";
import { ShardingErrorSerializationSchema } from "@effect/cluster/ShardingErrorSerialization";
import * as Schema from "@effect/schema/Schema";
export * from "@effect/cluster/ShardingErrorEntityNotManagedByThisPod";
export * from "@effect/cluster/ShardingErrorEntityTypeNotRegistered";
export * from "@effect/cluster/ShardingErrorMessageQueue";
export * from "@effect/cluster/ShardingErrorPodNoLongerRegistered";
export * from "@effect/cluster/ShardingErrorPodUnavailable";
export * from "@effect/cluster/ShardingErrorSendTimeout";
export * from "@effect/cluster/ShardingErrorSerialization";
/**
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.union(ShardingErrorSerializationSchema, ShardingErrorEntityNotManagedByThisPodSchema, ShardingErrorEntityTypeNotRegisteredSchema, ShardingErrorMessageQueueSchema, ShardingErrorPodNoLongerRegisteredSchema, ShardingErrorPodUnavailableSchema, ShardingErrorSendTimeoutSchema);
//# sourceMappingURL=ShardingError.mjs.map