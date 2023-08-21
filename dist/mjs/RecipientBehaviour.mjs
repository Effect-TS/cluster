import * as Effect from "@effect/io/Effect";
import * as PoisonPill from "@effect/shardcake/PoisonPill";
/**
 * An utility that process a message at a time, or interrupts on PoisonPill
 * @since 1.0.0
 * @category utils
 */
export const process = (dequeue, process) => Effect.forever(Effect.flatMap(process)(PoisonPill.takeOrInterrupt(dequeue)));
//# sourceMappingURL=RecipientBehaviour.mjs.map