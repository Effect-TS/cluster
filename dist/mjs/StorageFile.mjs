/**
 * @since 1.0.0
 */

import * as HashMap from "@effect/data/HashMap";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Queue from "@effect/io/Queue";
import * as Schema from "@effect/schema/Schema";
import * as Pod from "@effect/shardcake/Pod";
import * as PodAddress from "@effect/shardcake/PodAddress";
import * as ShardId from "@effect/shardcake/ShardId";
import * as Storage from "@effect/shardcake/Storage";
import * as Stream from "@effect/stream/Stream";
import * as fs from "fs";
import { jsonParse, jsonStringify } from "./utils";
const PODS_FILE = "pods.json";
const ASSIGNMENTS_FILE = "assignments.json";
const AssignmentsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.optionFromNullable(PodAddress.schema)));
const PodsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(PodAddress.schema, Pod.schema));
function writeJsonData(fileName, schema, data) {
  return Effect.orDie(Effect.flatMap(data => Effect.sync(() => fs.writeFileSync(fileName, data)))(jsonStringify(data, schema)));
}
function readJsonData(fileName, schema, empty) {
  return Effect.orDie(Effect.flatMap(exists => exists ? Effect.flatMap(data => jsonParse(data.toString(), schema))(Effect.sync(() => fs.readFileSync(fileName))) : Effect.succeed(empty))(Effect.sync(() => fs.existsSync(fileName))));
}
const getAssignments = /*#__PURE__*/Effect.map(HashMap.fromIterable)( /*#__PURE__*/readJsonData(ASSIGNMENTS_FILE, AssignmentsSchema, []));
function saveAssignments(assignments) {
  return writeJsonData(ASSIGNMENTS_FILE, AssignmentsSchema, Array.from(assignments));
}
const getPods = /*#__PURE__*/Effect.map(HashMap.fromIterable)( /*#__PURE__*/readJsonData(PODS_FILE, PodsSchema, []));
function savePods(pods) {
  return writeJsonData("pods.json", PodsSchema, Array.from(pods));
}
/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 */
function getChangesStream(fileName) {
  return Stream.unwrapScoped(Effect.flatMap(queue => Effect.map(([_, queue]) => Stream.fromQueue(queue))(Effect.acquireRelease(Effect.sync(() => [fs.watchFile(fileName, () => Effect.runSync(queue.offer(true))), queue]), ([watcher, queue]) => Effect.zip(queue.shutdown(), Effect.sync(() => watcher.unref()), {
    concurrent: true
  }))))(Queue.unbounded()));
}
const assignmentsStream = /*#__PURE__*/Stream.mapEffect(() => getAssignments)( /*#__PURE__*/getChangesStream(ASSIGNMENTS_FILE));
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