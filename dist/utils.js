"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.groupBy = groupBy;
exports.jsonParse = jsonParse;
exports.jsonStringify = jsonStringify;
exports.minByOption = minByOption;
exports.send = send;
exports.sendInternal = sendInternal;
exports.sendStream = sendStream;
exports.showHashMap = showHashMap;
exports.showHashSet = showHashSet;
exports.showOption = showOption;
var _Function = /*#__PURE__*/require("@effect/data/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var TreeFormatter = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/TreeFormatter"));
var _ShardError = /*#__PURE__*/require("@effect/shardcake/ShardError");
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var _nodeFetch = /*#__PURE__*/_interopRequireDefault( /*#__PURE__*/require("node-fetch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/** @internal */
function minByOption(f) {
  return fa => {
    let current = Option.none();
    for (const item of fa) {
      if (Option.isNone(current)) {
        current = Option.some(item);
      } else {
        if (f(item) < f(current.value)) {
          current = Option.some(item);
        }
      }
    }
    return current;
  };
}
/** @internal */
function groupBy(f) {
  return fa => {
    let current = HashMap.empty();
    for (const item of fa) {
      const k = f(item);
      if (HashMap.has(current, k)) {
        current = HashMap.modify(current, k, HashSet.add(item));
      } else {
        current = HashMap.set(current, k, HashSet.fromIterable([item]));
      }
    }
    return current;
  };
}
/** @internal */
function jsonStringify(value, schema) {
  return (0, _Function.pipe)(value, Schema.encode(schema), Effect.mapError(e => (0, _ShardError.EncodeError)(e)), Effect.map(_ => JSON.stringify(_)));
}
/** @internal */
function jsonParse(value, schema) {
  return (0, _Function.pipe)(Effect.sync(() => JSON.parse(value)), Effect.flatMap(Schema.decode(schema)), Effect.mapError(e => (0, _ShardError.DecodeError)(TreeFormatter.formatErrors(e.errors))));
}
/** @internal */
function sendInternal(send) {
  return (url, data) => (0, _Function.pipe)(jsonStringify(data, send),
  // Effect.tap((body) => Effect.logDebug("Sending HTTP request to " + url + " with data " + body)),
  Effect.flatMap(body => Effect.tryPromiseInterrupt({
    try: signal => {
      return (0, _nodeFetch.default)(url, {
        signal,
        method: "POST",
        body
      });
    },
    catch: error => (0, _ShardError.FetchError)(url, body, String(error))
  }))
  // Effect.tap((response) => Effect.logDebug(url + " status: " + response.status))
  );
}
/** @internal */
function send(send, reply) {
  return (url, data) => (0, _Function.pipe)(sendInternal(send)(url, data), Effect.flatMap(response => Effect.promise(() => response.text())), Effect.flatMap(data => jsonParse(data, reply)), Effect.orDie, Effect.flatten);
}
/** @internal */
function sendStream(send, reply) {
  return (url, data) => (0, _Function.pipe)(sendInternal(send)(url, data), Effect.map(response => (0, _Function.pipe)(Stream.fromAsyncIterable(response.body, e => (0, _ShardError.FetchError)(url, "", e)), Stream.map(value => typeof value === "string" ? value : value.toString()), Stream.splitLines, Stream.filter(line => line.length > 0), Stream.map(line => line.startsWith("data:") ? line.substring("data:".length).trim() : line), Stream.mapEffect(data => jsonParse(data, reply)), Stream.mapEffect(_ => _))), Stream.fromEffect, Stream.flatten);
}
/** @internal */
function showHashSet(fn) {
  return fa => {
    return "HashSet(" + Array.from(fa).map(fn).join("; ") + ")";
  };
}
/** @internal */
function showHashMap(fnK, fn) {
  return fa => {
    return "HashMap(" + Array.from(fa).map(([key, value]) => fnK(key) + "=" + fn(value)).join("; ") + ")";
  };
}
/** @internal */
function showOption(fn) {
  return fa => {
    return Option.match(fa, {
      onNone: () => "None()",
      onSome: _ => "Some(" + fn(_) + ")"
    });
  };
}
//# sourceMappingURL=utils.js.map