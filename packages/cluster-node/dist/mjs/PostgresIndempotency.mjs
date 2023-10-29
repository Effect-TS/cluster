import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";
export function make(begin, commit, rollback) {
  return message => use => Effect.acquireUseRelease(begin(message), () => use, (resource, exit) => Exit.isFailure(exit) ? rollback(resource, message) : commit(resource, message, Option.none()));
}
//# sourceMappingURL=PostgresIndempotency.mjs.map