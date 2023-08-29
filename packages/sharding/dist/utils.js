"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageReturnedNotingDefect = MessageReturnedNotingDefect;
exports.NotAMessageWithReplierDefect = NotAMessageWithReplierDefect;
exports.groupBy = groupBy;
exports.minByOption = minByOption;
exports.showHashMap = showHashMap;
exports.showHashSet = showHashSet;
exports.showOption = showOption;
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 * @internal
 */

/** @internal */
function NotAMessageWithReplierDefect(message) {
  return {
    _tag: "@effect/sharding/NotAMessageWithReplierDefect",
    message
  };
}
/** @internal */
function MessageReturnedNotingDefect(message) {
  return {
    _tag: "@effect/sharding/MessageReturnedNotingDefect",
    message
  };
}
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