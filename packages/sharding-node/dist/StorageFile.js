"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storageFile = void 0;
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Queue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Queue"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var Pod = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Pod"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/PodAddress"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardId"));
var Storage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Storage"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var fs = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("fs"));
var _utils = /*#__PURE__*/require("./utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

const PODS_FILE = "pods.json";
const ASSIGNMENTS_FILE = "assignments.json";
const AssignmentsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.optionFromNullable(PodAddress.schema)));
const PodsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(PodAddress.schema, Pod.schema));
function writeJsonData(fileName, schema, data) {
  return Effect.orDie(Effect.flatMap(data => Effect.sync(() => fs.writeFileSync(fileName, data)))((0, _utils.jsonStringify)(data, schema)));
}
function readJsonData(fileName, schema, empty) {
  return Effect.orDie(Effect.flatMap(exists => exists ? Effect.flatMap(data => (0, _utils.jsonParse)(data.toString(), schema))(Effect.sync(() => fs.readFileSync(fileName))) : Effect.succeed(empty))(Effect.sync(() => fs.existsSync(fileName))));
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
const storageFile = /*#__PURE__*/Layer.scoped(Storage.Storage, /*#__PURE__*/Effect.succeed({
  getAssignments,
  saveAssignments,
  assignmentsStream,
  getPods,
  savePods
}));
exports.storageFile = storageFile;
//# sourceMappingURL=StorageFile.js.map