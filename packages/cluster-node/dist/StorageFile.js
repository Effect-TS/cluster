"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonParse = jsonParse;
exports.jsonStringify = jsonStringify;
exports.storageFile = void 0;
var Pod = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Pod"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PodAddress"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardId"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardingError"));
var Storage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Storage"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var TreeFormatter = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/TreeFormatter"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var _Function = /*#__PURE__*/require("effect/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashMap"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
var Queue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Queue"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Stream"));
var fs = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("fs"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/** @internal */
function jsonStringify(value, schema) {
  return (0, _Function.pipe)(value, Schema.encode(schema), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))), Effect.map(_ => JSON.stringify(_)));
}
/** @internal */
function jsonParse(value, schema) {
  return (0, _Function.pipe)(Effect.sync(() => JSON.parse(value)), Effect.flatMap(Schema.decode(schema)), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))));
}
const PODS_FILE = "pods.json";
const ASSIGNMENTS_FILE = "assignments.json";
const AssignmentsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.optionFromNullable(PodAddress.schema)));
const PodsSchema = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(PodAddress.schema, Pod.schema));
function writeJsonData(fileName, schema, data) {
  return (0, _Function.pipe)(jsonStringify(data, schema), Effect.flatMap(data => Effect.sync(() => fs.writeFileSync(fileName, data))), Effect.orDie);
}
function readJsonData(fileName, schema, empty) {
  return (0, _Function.pipe)(Effect.sync(() => fs.existsSync(fileName)), Effect.flatMap(exists => exists ? (0, _Function.pipe)(Effect.sync(() => fs.readFileSync(fileName)), Effect.flatMap(data => jsonParse(data.toString(), schema))) : Effect.succeed(empty)), Effect.orDie);
}
const getAssignments = /*#__PURE__*/(0, _Function.pipe)( /*#__PURE__*/readJsonData(ASSIGNMENTS_FILE, AssignmentsSchema, []), /*#__PURE__*/Effect.map(HashMap.fromIterable));
function saveAssignments(assignments) {
  return writeJsonData(ASSIGNMENTS_FILE, AssignmentsSchema, Array.from(assignments));
}
const getPods = /*#__PURE__*/(0, _Function.pipe)( /*#__PURE__*/readJsonData(PODS_FILE, PodsSchema, []), /*#__PURE__*/Effect.map(HashMap.fromIterable));
function savePods(pods) {
  return writeJsonData("pods.json", PodsSchema, Array.from(pods));
}
/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 */
function getChangesStream(fileName) {
  return (0, _Function.pipe)(Queue.unbounded(), Effect.flatMap(queue => (0, _Function.pipe)(Effect.acquireRelease(Effect.sync(() => [fs.watchFile(fileName, () => Effect.runSync(queue.offer(true))), queue]), ([watcher, queue]) => Effect.zip(queue.shutdown(), Effect.sync(() => watcher.unref()), {
    concurrent: true
  })), Effect.map(([_, queue]) => Stream.fromQueue(queue)))), Stream.unwrapScoped);
}
const assignmentsStream = /*#__PURE__*/(0, _Function.pipe)( /*#__PURE__*/getChangesStream(ASSIGNMENTS_FILE), /*#__PURE__*/Stream.mapEffect(() => getAssignments));
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