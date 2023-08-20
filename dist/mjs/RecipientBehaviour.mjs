/**
 * @since 1.0.0
 */

import * as Effect from "@effect/io/Effect";
import * as PoisonPill from "@effect/shardcake/PoisonPill";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/ByteArray";
/**
 * @since 1.0.0
 * @category constructors
 */
export function dequeue(schema, dequeue) {
  return {
    _id: TypeId,
    schema: schema,
    dequeue,
    accept: () => Effect.unit
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function process(schema, process) {
  return {
    _id: TypeId,
    schema: schema,
    dequeue: (entityId, dequeue) => Effect.forever(Effect.flatMap(msg => process(entityId, msg))(PoisonPill.takeOrInterrupt(dequeue))),
    accept: () => Effect.unit
  };
}
/**
 * @since 1.0.0
 * @category utils
 */
export function onReceive(accept) {
  return recipientBehaviour => ({
    ...recipientBehaviour,
    accept: msg => accept(msg, recipientBehaviour.accept)
  });
}
//# sourceMappingURL=RecipientBehaviour.mjs.map