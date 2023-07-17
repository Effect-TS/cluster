/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Pod from "@effect/shardcake/Pod";
import * as PodAddress from "@effect/shardcake/PodAddress";
import * as ShardId from "@effect/shardcake/ShardId";
/**
 * @since 1.0.0
 * @category schema
 */
export const Register_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("Register"),
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const RegisterResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
export const Unregister_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("Unregister"),
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const UnregisterResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
export const NotifyUnhealthyPod_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("NotifyUnhealthyPod"),
  podAddress: PodAddress.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const NotifyUnhealthyPodResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
export const GetAssignments_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("GetAssignments")
});
/**
 * @since 1.0.0
 * @category schema
 */
export const GetAssignmentsResult_ = /*#__PURE__*/Schema.either(Schema.never, /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.option(PodAddress.schema))));
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.union(Register_, Unregister_, NotifyUnhealthyPod_, GetAssignments_);
//# sourceMappingURL=ShardManagerProtocolHttp.mjs.map