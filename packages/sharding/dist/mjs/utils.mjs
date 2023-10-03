/**
 * @since 1.0.0
 * @internal
 */
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
/** @internal */
export function NotAMessageWithReplierDefect(message) {
  return {
    _tag: "@effect/sharding/NotAMessageWithReplierDefect",
    message
  };
}
/** @internal */
export function MessageReturnedNotingDefect(message) {
  return {
    _tag: "@effect/sharding/MessageReturnedNotingDefect",
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