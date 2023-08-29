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
  pod: Pod.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const Unregister_ = Schema.struct({
  pod: Pod.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const NotifyUnhealthyPod_ = Schema.struct({
  podAddress: PodAddress.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const GetAssignmentsResult_ = Schema.array(
  Schema.tuple(ShardId.schema, Schema.option(PodAddress.schema))
)
