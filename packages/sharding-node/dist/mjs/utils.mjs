/**
 * @since 1.0.0
 * @internal
 */
import * as Chunk from "effect/Chunk";
import { pipe } from "effect/Function";
import * as Effect from "effect/Effect";
import * as Schema from "@effect/schema/Schema";
import * as TreeFormatter from "@effect/schema/TreeFormatter";
import * as ShardingError from "@effect/sharding/ShardingError";
import * as Stream from "effect/Stream";
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
  return pipe(value, Schema.encode(schema), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))), Effect.map(_ => JSON.stringify(_)));
}
/** @internal */
export function jsonParse(value, schema) {
  return pipe(Effect.sync(() => JSON.parse(value)), Effect.flatMap(Schema.decode(schema)), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))));
}
/** @internal */
export function sendInternal(send) {
  return (url, data) => pipe(jsonStringify(data, send),
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
  );
}
/** @internal */
export function send(send, reply) {
  return (url, data) => pipe(sendInternal(send)(url, data), Effect.flatMap(response => Effect.promise(() => response.text())), Effect.flatMap(data => jsonParse(data, reply)), Effect.orDie, Effect.flatten);
}
/** @internal */
export function sendStream(send, reply) {
  return (url, data) => pipe(sendInternal(send)(url, data), Effect.map(response => pipe(Stream.fromAsyncIterable(response.body, e => FetchError(url, "", String(e))), Stream.map(value => typeof value === "string" ? value : value.toString()), Stream.splitLines, Stream.filter(line => line.length > 0), Stream.map(line => line.startsWith("data:") ? line.substring("data:".length).trim() : line), Stream.mapEffect(data => jsonParse(data, reply)), Stream.mapEffect(_ => _))), Stream.fromEffect, Stream.flatten());
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