/**
 * @since 1.0.0
 */
import * as Pod from "@effect/cluster/Pod";
import * as PodAddress from "@effect/cluster/PodAddress";
import * as ShardId from "@effect/cluster/ShardId";
import * as Schema from "@effect/schema/Schema";
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