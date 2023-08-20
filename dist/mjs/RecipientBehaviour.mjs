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
  return dequeue(schema, (entityId, dequeue) => Effect.forever(Effect.flatMap(msg => process(entityId, msg))(PoisonPill.takeOrInterrupt(dequeue))));
}
/**
 * @since 1.0.0
 * @category utils
 */
export function onReceive(accept) {
  return recipientBehaviour => ({
    ...recipientBehaviour,
    accept: (entityId, msg) => accept(entityId, msg, recipientBehaviour.accept(entityId, msg))
  });
}
//# sourceMappingURL=RecipientBehaviour.mjs.map