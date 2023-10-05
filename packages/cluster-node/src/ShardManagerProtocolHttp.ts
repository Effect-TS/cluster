/**
 * @since 1.0.0
 */
import * as Pod from "@effect/cluster/Pod"
import * as PodAddress from "@effect/cluster/PodAddress"
import * as ShardId from "@effect/cluster/ShardId"
import * as Schema from "@effect/schema/Schema"

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
