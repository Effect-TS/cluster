/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Pod from "@effect/sharding/Pod";
import * as PodAddress from "@effect/sharding/PodAddress";
import * as ShardId from "@effect/sharding/ShardId";
/**
 * @since 1.0.0
 * @category schema
 */
export const Register_ = /*#__PURE__*/Schema.struct({
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const Unregister_ = /*#__PURE__*/Schema.struct({
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const NotifyUnhealthyPod_ = /*#__PURE__*/Schema.struct({
  podAddress: PodAddress.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const GetAssignmentsResult_ = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.option(PodAddress.schema)));
//# sourceMappingURL=ShardManagerProtocolHttp.mjs.map