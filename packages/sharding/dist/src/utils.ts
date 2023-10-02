/**
 * @since 1.0.0
 * @internal
 */
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as Option from "effect/Option"

/** @internal */
export function NotAMessageWithReplierDefect(message: unknown): unknown {
  return { _tag: "@effect/sharding/NotAMessageWithReplierDefect", message }
}

/** @internal */
export function MessageReturnedNotingDefect(message: unknown): unknown {
  return { _tag: "@effect/sharding/MessageReturnedNotingDefect", message }
}

/** @internal */
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

/** @internal */
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

/** @internal */
export function showHashSet<A>(fn: (value: A) => string) {
  return (fa: HashSet.HashSet<A>) => {
    return "HashSet(" + Array.from(fa).map(fn).join("; ") + ")"
  }
}

/** @internal */
export function showHashMap<K, A>(fnK: (value: K) => string, fn: (value: A) => string) {
  return (fa: HashMap.HashMap<K, A>) => {
    return "HashMap(" + Array.from(fa).map(([key, value]) => fnK(key) + "=" + fn(value)).join("; ") + ")"
  }
}

/** @internal */
export function showOption<A>(fn: (value: A) => string) {
  return (fa: Option.Option<A>) => {
    return Option.match(fa, { onNone: () => "None()", onSome: (_) => "Some(" + fn(_) + ")" })
  }
}
