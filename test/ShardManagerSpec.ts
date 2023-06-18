import * as HashMap from "@effect/data/HashMap"
import * as Option from "@effect/data/Option"
import * as Pod from "@effect/shardcake/Pod"
import * as PodAddress from "@effect/shardcake/PodAddress"
import * as PodWithMetadata from "@effect/shardcake/PodWithMetadata"
import * as ShardId from "@effect/shardcake/ShardId"
import * as ShardManager from "@effect/shardcake/ShardManager"
import * as ShardManagerState from "@effect/shardcake/ShardManagerState"
import { assertTrue } from "@effect/shardcake/test/util"

describe.concurrent("ShardManagerSpec", () => {
  const pod1 = PodWithMetadata.apply(Pod.pod(PodAddress.podAddress("1", 1), "1.0.0"), 0)
  const pod2 = PodWithMetadata.apply(Pod.pod(PodAddress.podAddress("2", 2), "1.0.0"), 0)
  const pod3 = PodWithMetadata.apply(Pod.pod(PodAddress.podAddress("3", 3), "1.0.0"), 0)

  it("Rebalance unbalanced assignments", () => {
    const state = ShardManagerState.shardManagerState(
      HashMap.fromIterable([
        [pod1.pod.address, pod1],
        [pod2.pod.address, pod2]
      ]),
      HashMap.fromIterable([
        [ShardId.shardId(1), Option.some(pod1.pod.address)],
        [ShardId.shardId(2), Option.some(pod1.pod.address)]
      ])
    )
    const [assignments, unassignments] = ShardManager.decideAssignmentsForUnbalancedShards(state, 1)

    assertTrue(HashMap.has(assignments, pod2.pod.address))
    assertTrue(HashMap.size(assignments) === 1)
    assertTrue(HashMap.has(unassignments, pod1.pod.address))
    assertTrue(HashMap.size(unassignments) === 1)
  })

  it("Don't rebalance to pod with older version", () => {
    const newerPod2 = PodWithMetadata.apply(Pod.pod(pod2.pod.address, "0.1.2"), pod2.registered)
    const state = ShardManagerState.shardManagerState(
      HashMap.fromIterable([
        [pod1.pod.address, pod1],
        [pod2.pod.address, newerPod2]
      ]),
      HashMap.fromIterable([
        [ShardId.shardId(1), Option.some(pod1.pod.address)],
        [ShardId.shardId(2), Option.some(pod1.pod.address)]
      ])
    )
    const [assignments, unassignments] = ShardManager.decideAssignmentsForUnbalancedShards(state, 1)

    assertTrue(HashMap.isEmpty(assignments))
    assertTrue(HashMap.isEmpty(unassignments))
  })

  it("Don't rebalance when already well balanced", () => {
    const state = ShardManagerState.shardManagerState(
      HashMap.fromIterable([
        [pod1.pod.address, pod1],
        [pod2.pod.address, pod2]
      ]),
      HashMap.fromIterable([
        [ShardId.shardId(1), Option.some(pod1.pod.address)],
        [ShardId.shardId(2), Option.some(pod2.pod.address)]
      ])
    )
    const [assignments, unassignments] = ShardManager.decideAssignmentsForUnbalancedShards(state, 1)

    assertTrue(HashMap.isEmpty(assignments))
    assertTrue(HashMap.isEmpty(unassignments))
  })
  it("Don't rebalance when only 1 shard difference", () => {
    const state = ShardManagerState.shardManagerState(
      HashMap.fromIterable([
        [pod1.pod.address, pod1],
        [pod2.pod.address, pod2]
      ]),
      HashMap.fromIterable([
        [ShardId.shardId(1), Option.some(pod1.pod.address)],
        [ShardId.shardId(2), Option.some(pod1.pod.address)],
        [ShardId.shardId(3), Option.some(pod2.pod.address)]
      ])
    )
    const [assignments, unassignments] = ShardManager.decideAssignmentsForUnbalancedShards(state, 1)

    assertTrue(HashMap.isEmpty(assignments))
    assertTrue(HashMap.isEmpty(unassignments))
  })
  it("Rebalance when 2 shard difference", () => {
    const state = ShardManagerState.shardManagerState(
      HashMap.fromIterable([
        [pod1.pod.address, pod1],
        [pod2.pod.address, pod2]
      ]),
      HashMap.fromIterable([
        [ShardId.shardId(1), Option.some(pod1.pod.address)],
        [ShardId.shardId(2), Option.some(pod1.pod.address)],
        [ShardId.shardId(3), Option.some(pod1.pod.address)],
        [ShardId.shardId(4), Option.some(pod2.pod.address)]
      ])
    )
    const [assignments, unassignments] = ShardManager.decideAssignmentsForUnbalancedShards(state, 1)

    assertTrue(HashMap.has(assignments, pod2.pod.address))
    assertTrue(HashMap.size(assignments) === 1)
    assertTrue(HashMap.has(unassignments, pod1.pod.address))
    assertTrue(HashMap.size(unassignments) === 1)
  })
  it("Pick the pod with less shards", () => {
    const state = ShardManagerState.shardManagerState(
      HashMap.fromIterable([
        [pod1.pod.address, pod1],
        [pod2.pod.address, pod2],
        [pod3.pod.address, pod3]
      ]),
      HashMap.fromIterable([
        [ShardId.shardId(1), Option.some(pod1.pod.address)],
        [ShardId.shardId(2), Option.some(pod1.pod.address)],
        [ShardId.shardId(3), Option.some(pod2.pod.address)]
      ])
    )
    const [assignments, unassignments] = ShardManager.decideAssignmentsForUnbalancedShards(state, 1)

    assertTrue(HashMap.has(assignments, pod3.pod.address))
    assertTrue(HashMap.size(assignments) === 1)
    assertTrue(HashMap.has(unassignments, pod1.pod.address))
    assertTrue(HashMap.size(unassignments) === 1)
  })

  it("Don't rebalance if pod list is empty", () => {
    const state = ShardManagerState.shardManagerState(
      HashMap.fromIterable([]),
      HashMap.fromIterable([
        [ShardId.shardId(1), Option.some(pod1.pod.address)]
      ])
    )
    const [assignments, unassignments] = ShardManager.decideAssignmentsForUnbalancedShards(state, 1)

    assertTrue(HashMap.isEmpty(assignments))
    assertTrue(HashMap.isEmpty(unassignments))
  })
})
