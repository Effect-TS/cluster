/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
export * from "@effect/sharding/ShardingError/ShardingEntityNotManagedByThisPodError";
export * from "@effect/sharding/ShardingError/ShardingEntityTypeNotRegisteredError";
export * from "@effect/sharding/ShardingError/ShardingMessageQueueError";
export * from "@effect/sharding/ShardingError/ShardingPodNoLongerRegisteredError";
export * from "@effect/sharding/ShardingError/ShardingPodUnavailableError";
export * from "@effect/sharding/ShardingError/ShardingSendTimeoutError";
export * from "@effect/sharding/ShardingError/ShardingSerializationError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorSchema: Schema.Schema<{
    readonly entityId: string;
    readonly _tag: "@effect/sharding/ShardingEntityNotManagedByThisPodError";
} | {
    readonly entityType: string;
    readonly _tag: "@effect/sharding/ShardingEntityTypeNotRegisteredError";
    readonly podAddress: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/sharding/ShardingMessageQueueError";
    readonly error: string;
} | {
    readonly _tag: "@effect/sharding/ShardingPodNoLongerRegisteredError";
    readonly podAddress: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/sharding/ShardingPodUnavailableError";
    readonly pod: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/sharding/ShardingSendTimeoutError";
} | {
    readonly _tag: "@effect/sharding/ShardingSerializationError";
    readonly error: string;
}, import("@effect/sharding/ShardingError/ShardingEntityNotManagedByThisPodError").ShardingEntityNotManagedByThisPodError | import("@effect/sharding/ShardingError/ShardingEntityTypeNotRegisteredError").ShardingEntityTypeNotRegisteredError | import("@effect/sharding/ShardingError/ShardingMessageQueueError").ShardingMessageQueueError | import("@effect/sharding/ShardingError/ShardingPodNoLongerRegisteredError").ShardingPodNoLongerRegisteredError | import("@effect/sharding/ShardingError/ShardingPodUnavailableError").ShardingPodUnavailableError | import("@effect/sharding/ShardingError/ShardingSendTimeoutError").ShardingSendTimeoutError | import("@effect/sharding/ShardingError/ShardingSerializationError").ShardingSerializationError>;
/**
 * @since 1.0.0
 * @category models
 */
export type ShardingError = Schema.To<typeof ShardingErrorSchema>;
//# sourceMappingURL=index.d.ts.map