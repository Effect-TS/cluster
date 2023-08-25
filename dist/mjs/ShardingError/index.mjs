import * as Schema from "@effect/schema/Schema";
import { ShardingDecodeErrorSchema } from "@effect/shardcake/ShardingError/ShardingDecodeError";
import { ShardingEncodeErrorSchema } from "@effect/shardcake/ShardingError/ShardingEncodeError";
import { ShardingEntityNotManagedByThisPodErrorSchema } from "@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError";
import { ShardingEntityTypeNotRegisteredErrorSchema } from "@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError";
import { ShardingMessageQueueOfferErrorSchema } from "@effect/shardcake/ShardingError/ShardingMessageQueueOfferError";
import { ShardingPodNoLongerRegisteredErrorSchema } from "@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError";
import { ShardingPodUnavailableErrorSchema } from "@effect/shardcake/ShardingError/ShardingPodUnavailableError";
import { ShardingReplyErrorSchema } from "@effect/shardcake/ShardingError/ShardingReplyError";
import { ShardingSendErrorSchema } from "@effect/shardcake/ShardingError/ShardingSendError";
import { ShardingSendTimeoutErrorSchema } from "@effect/shardcake/ShardingError/ShardingSendTimeoutError";
export * from "@effect/shardcake/ShardingError/ShardingDecodeError";
export * from "@effect/shardcake/ShardingError/ShardingEncodeError";
export * from "@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError";
export * from "@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError";
export * from "@effect/shardcake/ShardingError/ShardingMessageQueueOfferError";
export * from "@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError";
export * from "@effect/shardcake/ShardingError/ShardingPodUnavailableError";
export * from "@effect/shardcake/ShardingError/ShardingReplyError";
export * from "@effect/shardcake/ShardingError/ShardingSendError";
export * from "@effect/shardcake/ShardingError/ShardingSendTimeoutError";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSchema = /*#__PURE__*/Schema.union(ShardingDecodeErrorSchema, ShardingEncodeErrorSchema, ShardingEntityNotManagedByThisPodErrorSchema, ShardingEntityTypeNotRegisteredErrorSchema, ShardingMessageQueueOfferErrorSchema, ShardingPodNoLongerRegisteredErrorSchema, ShardingPodUnavailableErrorSchema, ShardingReplyErrorSchema, ShardingSendErrorSchema, ShardingSendTimeoutErrorSchema);
//# sourceMappingURL=index.mjs.map