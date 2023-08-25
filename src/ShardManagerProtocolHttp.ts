/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Pod from "@effect/sharding/Pod"
import * as PodAddress from "@effect/sharding/PodAddress"
import * as ShardId from "@effect/sharding/ShardId"

/**
 * @since 1.0.0
 * @category schema
 */
export const Register_ = Schema.struct({
  _tag: Schema.literal("Register"),
  pod: Pod.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const RegisterResult_ = Schema.either(Schema.never, Schema.boolean)

/**
 * @since 1.0.0
 * @category schema
 */
export const Unregister_ = Schema.struct({
  _tag: Schema.literal("Unregister"),
  pod: Pod.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const UnregisterResult_ = Schema.either(Schema.never, Schema.boolean)

/**
 * @since 1.0.0
 * @category schema
 */
export const NotifyUnhealthyPod_ = Schema.struct({
  _tag: Schema.literal("NotifyUnhealthyPod"),
  podAddress: PodAddress.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const NotifyUnhealthyPodResult_ = Schema.either(Schema.never, Schema.boolean)

/**
 * @since 1.0.0
 * @category schema
 */
export const GetAssignments_ = Schema.struct({
  _tag: Schema.literal("GetAssignments")
})

/**
 * @since 1.0.0
 * @category schema
 */
export const GetAssignmentsResult_ = Schema.either(
  Schema.never,
  Schema.array(
    Schema.tuple(ShardId.schema, Schema.option(PodAddress.schema))
  )
)

/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.union(Register_, Unregister_, NotifyUnhealthyPod_, GetAssignments_)
