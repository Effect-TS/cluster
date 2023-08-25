import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import * as TreeFormatter from "@effect/schema/TreeFormatter";
import * as ShardingError from "@effect/shardcake/ShardingError";
import * as Stream from "@effect/stream/Stream";
import fetch from "node-fetch";
/** @internal */
export function FetchError(url, body, error) {
  return {
    _tag: "FetchError",
    url,
    body,
    error
  };
}
/** @internal */
export function isFetchError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value._tag === "FetchError";
}
/** @internal */
export function NotAMessageWithReplierDefect(message) {
  return {
    _tag: "@effect/shardcake/NotAMessageWithReplierDefect",
    message
  };
}
/** @internal */
export function MessageReturnedNotingDefect(message) {
  return {
    _tag: "@effect/shardcake/MessageReturnedNotingDefect",
    message
  };
}
/** @internal */
export function minByOption(f) {
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
export function groupBy(f) {
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
export function jsonStringify(value, schema) {
  return Effect.map(_ => JSON.stringify(_))(Effect.mapError(e => ShardingError.ShardingEncodeError(TreeFormatter.formatErrors(e.errors)))(Schema.encode(schema)(value)));
}
/** @internal */
export function jsonParse(value, schema) {
  return Effect.mapError(e => ShardingError.ShardingDecodeError(TreeFormatter.formatErrors(e.errors)))(Effect.flatMap(Schema.decode(schema))(Effect.sync(() => JSON.parse(value))));
}
/** @internal */
export function sendInternal(send) {
  return (url, data) =>
  // Effect.tap((body) => Effect.logDebug("Sending HTTP request to " + url + " with data " + body)),
  Effect.flatMap(body => Effect.tryPromise({
    try: signal => {
      return fetch(url, {
        signal,
        method: "POST",
        body
      });
    },
    catch: error => FetchError(url, body, String(error))
  }))
  // Effect.tap((response) => Effect.logDebug(url + " status: " + response.status))
  (jsonStringify(data, send));
}
/** @internal */
export function send(send, reply) {
  return (url, data) => Effect.flatten(Effect.orDie(Effect.flatMap(data => jsonParse(data, reply))(Effect.flatMap(response => Effect.promise(() => response.text()))(sendInternal(send)(url, data)))));
}
/** @internal */
export function sendStream(send, reply) {
  return (url, data) => Stream.flatten()(Stream.fromEffect(Effect.map(response => Stream.mapEffect(_ => _)(Stream.mapEffect(data => jsonParse(data, reply))(Stream.map(line => line.startsWith("data:") ? line.substring("data:".length).trim() : line)(Stream.filter(line => line.length > 0)(Stream.splitLines(Stream.map(value => typeof value === "string" ? value : value.toString())(Stream.fromAsyncIterable(response.body, e => FetchError(url, "", String(e))))))))))(sendInternal(send)(url, data))));
}
/** @internal */
export function showHashSet(fn) {
  return fa => {
    return "HashSet(" + Array.from(fa).map(fn).join("; ") + ")";
  };
}
/** @internal */
export function showHashMap(fnK, fn) {
  return fa => {
    return "HashMap(" + Array.from(fa).map(([key, value]) => fnK(key) + "=" + fn(value)).join("; ") + ")";
  };
}
/** @internal */
export function showOption(fn) {
  return fa => {
    return Option.match(fa, {
      onNone: () => "None()",
      onSome: _ => "Some(" + fn(_) + ")"
    });
  };
}
//# sourceMappingURL=utils.mjs.map