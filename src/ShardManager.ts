import * as ShardManagerState from "./ShardManagerState";
import * as RefSynchronized from "@effect/io/Ref/Synchronized";
import * as Effect from "@effect/io/Effect";
import * as Hub from "@effect/io/Hub";
import * as ShardingEvent from "./ShardingEvent";
import * as PodsHealth from "./PodsHealth";
import * as Pods from "./Pods";
import * as ManagerConfig from "./ManagerConfig";
import { pipe } from "@fp-ts/core/Function";
import * as HashMap from "@fp-ts/data//HashMap";
import * as HashSet from "@fp-ts/data/HashSet";
import * as ShardId from "./ShardId";
import * as PodAddress from "./PodAddress";
import * as PodWithMetadata from "./PodWithMetadata";
import * as Option from "@fp-ts/core/Option";
import * as Stream from "@effect/stream/Stream";
import * as Schedule from "@effect/io/Schedule";
import * as Storage from ".//Storage";
import * as Pod from "./Pod";

export function apply(
  stateRef: RefSynchronized.Synchronized<ShardManagerState.ShardManagerState>,
  rebalanceSemaphore: Effect.Semaphore,
  eventsHub: Hub.Hub<ShardingEvent.ShardingEvent>,
  healthApi: PodsHealth.PodsHealth,
  podApi: Pods.Pods,
  stateRepository: Storage.Storage,
  config: ManagerConfig.ManagerConfig
) {
  const getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  > = pipe(
    RefSynchronized.get(stateRef),
    Effect.map((_) => _.shards)
  );

  const getShardingEvents = Stream.fromHub(eventsHub);

  function register(pod: Pod.Pod) {
    return pipe(
      Effect.logInfo("Registering " + JSON.stringify(pod)),
      Effect.zipRight(
        RefSynchronized.updateAndGetEffect(stateRef, (state) =>
          pipe(
            Effect.flatMap(Effect.clock(), (_) => _.currentTimeMillis()),
            Effect.map((millis) => new Date(millis)),
            Effect.map((cdt) =>
              ShardManagerState.apply(
                HashMap.set(state.pods, pod.address, PodWithMetadata.apply(pod, cdt)),
                state.shards
              )
            )
          )
        )
      ),
      Effect.flatMap((state) =>
        Effect.when(rebalance(false), () => HashSet.size(state.unassignedShards) > 0)
      ),
      Effect.zipRight(Effect.forkDaemon(persistPods)),
      Effect.asUnit
    );
  }

  function withRetry<E, A>(zio: Effect.Effect<never, E, A>): Effect.Effect<never, never, void> {
    return pipe(
      zio,
      Effect.retry(
        pipe(
          Schedule.spaced(config.persistRetryInterval),
          Schedule.andThen(Schedule.recurs(config.persistRetryCount))
        )
      ),
      Effect.ignore
    );
  }

  const persistAssignments = withRetry(
    pipe(
      RefSynchronized.get(stateRef),
      Effect.flatMap((state) => stateRepository.saveAssignments(state.shards))
    )
  );

  const persistPods = withRetry(
    pipe(
      RefSynchronized.get(stateRef),
      Effect.flatMap((state) => stateRepository.savePods(HashMap.map(state.pods, (v) => v.pod)))
    )
  );

  return { getAssignments, getShardingEvents, register };
}
