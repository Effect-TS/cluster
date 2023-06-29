import * as Schema from "@effect/schema/Schema"
import * as Pod from "@effect/shardcake/Pod"
import * as PodAddress from "@effect/shardcake/PodAddress"
import * as ShardId from "@effect/shardcake/ShardId"

export const Register_ = Schema.struct({
  _tag: Schema.literal("Register"),
  pod: Pod.Schema_
})
export const RegisterResult_ = Schema.either(Schema.never, Schema.boolean)

export const Unregister_ = Schema.struct({
  _tag: Schema.literal("Unregister"),
  pod: Pod.Schema_
})
export const UnregisterResult_ = Schema.either(Schema.never, Schema.boolean)

export const NotifyUnhealthyPod_ = Schema.struct({
  _tag: Schema.literal("NotifyUnhealthyPod"),
  podAddress: PodAddress.schema
})
export const NotifyUnhealthyPodResult_ = Schema.either(Schema.never, Schema.boolean)

export const GetAssignments_ = Schema.struct({
  _tag: Schema.literal("GetAssignments")
})
export const GetAssignmentsResult_ = Schema.either(
  Schema.never,
  Schema.array(
    Schema.tuple(ShardId.schema, Schema.option(PodAddress.schema))
  )
)
export const schema = Schema.union(Register_, Unregister_, NotifyUnhealthyPod_, GetAssignments_)
