/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Pod from "@effect/sharding/Pod";
import * as PodAddress from "@effect/sharding/PodAddress";
import * as ShardId from "@effect/sharding/ShardId";
import * as Storage from "@effect/sharding/Storage";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";
import * as fs from "fs";
import { jsonParse, jsonStringify } from "./utils";
const PODS_FILE = "pods.json";
const ASSIGNMENTS_FILE = "assignments.json";
const AssignmentsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.optionFromNullable(PodAddress.schema)));
const PodsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(PodAddress.schema, Pod.schema));
function writeJsonData(fileName, schema, data) {
  return pipe(jsonStringify(data, schema), Effect.flatMap(data => Effect.sync(() => fs.writeFileSync(fileName, data))), Effect.orDie);
}
function readJsonData(fileName, schema, empty) {
  return pipe(Effect.sync(() => fs.existsSync(fileName)), Effect.flatMap(exists => exists ? pipe(Effect.sync(() => fs.readFileSync(fileName)), Effect.flatMap(data => jsonParse(data.toString(), schema))) : Effect.succeed(empty)), Effect.orDie);
}
const getAssignments = /*#__PURE__*/pipe( /*#__PURE__*/readJsonData(ASSIGNMENTS_FILE, AssignmentsSchema, []), /*#__PURE__*/Effect.map(HashMap.fromIterable));
function saveAssignments(assignments) {
  return writeJsonData(ASSIGNMENTS_FILE, AssignmentsSchema, Array.from(assignments));
}
const getPods = /*#__PURE__*/pipe( /*#__PURE__*/readJsonData(PODS_FILE, PodsSchema, []), /*#__PURE__*/Effect.map(HashMap.fromIterable));
function savePods(pods) {
  return writeJsonData("pods.json", PodsSchema, Array.from(pods));
}
/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 */
function getChangesStream(fileName) {
  return pipe(Queue.unbounded(), Effect.flatMap(queue => pipe(Effect.acquireRelease(Effect.sync(() => [fs.watchFile(fileName, () => Effect.runSync(queue.offer(true))), queue]), ([watcher, queue]) => Effect.zip(queue.shutdown(), Effect.sync(() => watcher.unref()), {
    concurrent: true
  })), Effect.map(([_, queue]) => Stream.fromQueue(queue)))), Stream.unwrapScoped);
}
const assignmentsStream = /*#__PURE__*/pipe( /*#__PURE__*/getChangesStream(ASSIGNMENTS_FILE), /*#__PURE__*/Stream.mapEffect(() => getAssignments));
/**
 * @since 1.0.0
 * @category layers
 */
export const storageFile = /*#__PURE__*/Layer.scoped(Storage.Storage, /*#__PURE__*/Effect.succeed({
  getAssignments,
  saveAssignments,
  assignmentsStream,
  getPods,
  savePods
}));
//# sourceMappingURL=StorageFile.mjs.map