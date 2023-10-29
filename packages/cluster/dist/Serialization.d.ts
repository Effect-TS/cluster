/**
 * @since 1.0.0
 */
import * as SerializedMessage from "@effect/cluster/SerializedMessage";
import * as ShardingError from "@effect/cluster/ShardingError";
import * as Schema from "@effect/schema/Schema";
import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId: unique symbol;
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * An interface to serialize user messages that will be sent between pods.
 * @since 1.0.0
 * @category models
 */
export interface Serialization {
    /**
     * @since 1.0.0
     */
    readonly _id: TypeId;
    /**
     * Transforms the given message into binary
     * @since 1.0.0
     */
    readonly encode: <I, A>(schema: Schema.Schema<I, A>, message: A) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, SerializedMessage.SerializedMessage>;
    /**
     * Transform binary back into the given type
     * @since 1.0.0
     */
    readonly decode: <I, A>(schema: Schema.Schema<I, A>, bytes: SerializedMessage.SerializedMessage) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, A>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const Serialization: Tag<Serialization, Serialization>;
/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 * @since 1.0.0
 * @category layers
 */
export declare const json: Layer.Layer<never, never, Serialization>;
//# sourceMappingURL=Serialization.d.ts.map