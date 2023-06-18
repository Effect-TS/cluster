import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as HashSet from "@effect/data/HashSet"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Schema from "@effect/schema/Schema"
import type { WireThrowable } from "@effect/shardcake/ShardError"
import { DecodeError, EncodeError, FetchError } from "@effect/shardcake/ShardError"
import fetch from "node-fetch"

export function minByOption<A>(f: (value: A) => number) {
  return (fa: Iterable<A>) => {
    let current: Option.Option<A> = Option.none()
    for (const item of fa) {
      if (Option.isNone(current)) {
        current = Option.some(item)
      } else {
        if (f(item) < f(current.value)) {
          current = Option.some(item)
        }
      }
    }
    return current
  }
}

export function groupBy<A, K>(f: (value: A) => K) {
  return (fa: Iterable<A>) => {
    let current = HashMap.empty<K, HashSet.HashSet<A>>()
    for (const item of fa) {
      const k = f(item)
      if (HashMap.has(current, k)) {
        current = HashMap.modify(current, k, HashSet.add(item))
      } else {
        current = HashMap.set(current, k, HashSet.fromIterable([item]))
      }
    }
    return current
  }
}

export function jsonStringify<A>(value: A, schema: Schema.Schema<any, A>) {
  return pipe(
    value,
    Schema.encodeEffect(schema),
    Effect.mapError((e) => EncodeError(e)),
    Effect.map((_) => JSON.stringify(_))
  )
}
export function jsonParse<A>(value: string, schema: Schema.Schema<any, A>) {
  return pipe(
    Effect.sync(() => JSON.parse(value)),
    Effect.flatMap(Schema.decodeEffect(schema)),
    Effect.mapError((e) => DecodeError(e))
  )
}

export function send<A, R>(send: Schema.Schema<any, A>, reply: Schema.Schema<any, R>) {
  return (url: string, data: A): Effect.Effect<never, WireThrowable, R> =>
    pipe(
      jsonStringify(data, send),
      Effect.flatMap((body) =>
        Effect.tryCatchPromise(
          () => {
            return fetch(url, {
              method: "POST",
              body
            })
          },
          (error) => FetchError(url, body, String(error))
        )
      ),
      Effect.flatMap((response) => Effect.promise(() => response.text())),
      Effect.flatMap((data) => jsonParse(data, reply))
    )
}
