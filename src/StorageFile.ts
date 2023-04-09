import * as fs from "fs";
import * as Storage from "./Storage";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { Tag } from "@effect/data/Context";
import { pipe } from "@effect/data/Function";
import * as Option from "@effect/data/Option";
import * as PodAddress from "./PodAddress";
import * as HashMap from "@effect/data/HashMap";
import * as ShardId from "./ShardId";
import * as Stream from "@effect/stream/Stream";
import * as SubscriptionRef from "@effect/stream/SubscriptionRef";
import * as Ref from "@effect/io/Ref";
import * as Schema from "@effect/schema/Schema";
import * as Queue from "@effect/io/Queue";
import * as Pod from "./Pod";

const PODS_FILE = "pods.json";
const ASSIGNMENTS_FILE = "assignments.json";

const AssignmentsSchema = Schema.array(
  Schema.tuple(ShardId.Schema_, Schema.optionFromNullable(PodAddress.Schema_))
);

const PodsSchema = Schema.array(Schema.tuple(PodAddress.Schema_, Pod.Schema_));

function writeJsonData<A>(fileName: string, schema: Schema.Schema<any, A>, data: A) {
  return pipe(
    Schema.encodeEffect(schema)(data),
    Effect.orDie,
    Effect.flatMap((data) => Effect.sync(() => fs.writeFileSync(fileName, JSON.stringify(data))))
  );
}

function readJsonData<A>(fileName: string, schema: Schema.Schema<any, A>) {
  return pipe(
    Effect.sync(() => fs.readFileSync(fileName)),
    Effect.flatMap((data) => Schema.decodeEffect(schema)(data)),
    Effect.orDie
  );
}

const getAssignments: Effect.Effect<
  never,
  never,
  HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
> = pipe(readJsonData(ASSIGNMENTS_FILE, AssignmentsSchema), Effect.map(HashMap.fromIterable));

function saveAssignments(
  assignments: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
): Effect.Effect<never, never, void> {
  return writeJsonData(ASSIGNMENTS_FILE, AssignmentsSchema, Array.from(assignments));
}

const getPods: Effect.Effect<never, never, HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>> = pipe(
  readJsonData(PODS_FILE, PodsSchema),
  Effect.map(HashMap.fromIterable)
);

function savePods(
  pods: HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>
): Effect.Effect<never, never, void> {
  return writeJsonData("pods.json", PodsSchema, Array.from(pods));
}

/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 */

function getChangesStream(fileName: string) {
  return pipe(
    Queue.unbounded<boolean>(),
    Effect.flatMap((queue) =>
      pipe(
        Effect.acquireRelease(
          Effect.sync(
            () => [fs.watchFile(fileName, () => Effect.runSync(queue.offer(true))), queue] as const
          ),
          ([watcher, queue]) =>
            Effect.zipPar(
              queue.shutdown(),
              Effect.sync(() => watcher.unref())
            )
        ),
        Effect.map(([_, queue]) => Stream.fromQueue(queue))
      )
    ),
    Stream.unwrapScoped
  );
}

const assignmentsStream = pipe(
  getChangesStream(ASSIGNMENTS_FILE),
  Stream.mapEffect(() => getAssignments)
);

export const storageFile = Layer.scoped(
  Storage.Storage,
  Effect.succeed({
    getAssignments,
    saveAssignments,
    assignmentsStream,
    getPods,
    savePods,
  })
);
