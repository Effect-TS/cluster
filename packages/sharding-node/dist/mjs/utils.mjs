/**
 * @since 1.0.0
 * @internal
 */
import * as Chunk from "@effect/data/Chunk";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import * as TreeFormatter from "@effect/schema/TreeFormatter";
import * as ShardingError from "@effect/sharding/ShardingError";
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
export function jsonStringify(value, schema) {
  return Effect.map(_ => JSON.stringify(_))(Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors)))(Schema.encode(schema)(value)));
}
/** @internal */
export function jsonParse(value, schema) {
  return Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors)))(Effect.flatMap(Schema.decode(schema))(Effect.sync(() => JSON.parse(value))));
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
export function stringFromUint8ArrayString(encoding) {
  return stream => {
    const decoder = new TextDecoder(encoding);
    return Stream.mapChunks(stream, Chunk.map(bytes => decoder.decode(bytes)));
  };
}
/** @internal */
export function uint8ArrayFromStringStream() {
  return stream => {
    const decoder = new TextEncoder();
    return Stream.mapChunks(stream, Chunk.map(strings => decoder.encode(strings)));
  };
}
//# sourceMappingURL=utils.mjs.map