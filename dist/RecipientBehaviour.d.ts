import * as Effect from "@effect/io/Effect";
import type * as Queue from "@effect/io/Queue";
import type * as Schema from "@effect/schema/Schema";
import type { JsonData } from "@effect/shardcake/JsonData";
import * as PoisonPill from "@effect/shardcake/PoisonPill";
import type { Throwable } from "@effect/shardcake/ShardError";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/ByteArray";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * An abstract type to extend for each type of entity or topic
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Msg> {
    readonly _id: TypeId;
    readonly schema: Schema.Schema<JsonData, Msg>;
    readonly dequeue: (entityId: string, dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>) => Effect.Effect<R, never, void>;
    readonly accept: (entityId: string, msg: Msg) => Effect.Effect<R, Throwable, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function dequeue<I extends JsonData, Msg, R>(schema: Schema.Schema<I, Msg>, dequeue: (entityId: string, dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>) => Effect.Effect<R, never, void>): RecipientBehaviour<R, Msg>;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function process<I extends JsonData, Msg, R>(schema: Schema.Schema<I, Msg>, process: (entityId: string, msg: Msg) => Effect.Effect<R, never, void>): RecipientBehaviour<R, Msg>;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function onReceive<Msg, R>(accept: (entityId: string, msg: Msg, next: Effect.Effect<never, Throwable, void>) => Effect.Effect<R, Throwable, void>): <R1>(recipientBehaviour: RecipientBehaviour<R1, Msg>) => RecipientBehaviour<R | R1, Msg>;
//# sourceMappingURL=RecipientBehaviour.d.ts.map