import * as Schema from "@effect/schema/Schema";
export * from "@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError";
export * from "@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError";
export * from "@effect/shardcake/ShardingError/ShardingMessageQueueError";
export * from "@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError";
export * from "@effect/shardcake/ShardingError/ShardingPodUnavailableError";
export * from "@effect/shardcake/ShardingError/ShardingSendTimeoutError";
export * from "@effect/shardcake/ShardingError/ShardingSerializationError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingMessageQueueError";
    readonly error: string;
} | {
    readonly _tag: "@effect/shardcake/ShardingSerializationError";
    readonly error: string;
} | {
    readonly _tag: "@effect/shardcake/ShardingEntityNotManagedByThisPodError";
    readonly entityId: string;
} | {
    readonly _tag: "@effect/shardcake/ShardingEntityTypeNotRegisteredError";
    readonly entityType: string;
    readonly podAddress: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/shardcake/ShardingPodNoLongerRegisteredError";
    readonly podAddress: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/shardcake/ShardingPodUnavailableError";
    readonly pod: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/shardcake/ShardingSendTimeoutError";
}, import("@effect/shardcake/ShardingError/ShardingMessageQueueError").ShardingMessageQueueError | import("@effect/shardcake/ShardingError/ShardingSerializationError").ShardingSerializationError | import("@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError").ShardingEntityNotManagedByThisPodError | import("@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError").ShardingEntityTypeNotRegisteredError | import("@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError").ShardingPodNoLongerRegisteredError | import("@effect/shardcake/ShardingError/ShardingPodUnavailableError").ShardingPodUnavailableError | import("@effect/shardcake/ShardingError/ShardingSendTimeoutError").ShardingSendTimeoutError>;
/**
 * @since 1.0.0
 * @category models
 */
export type ShardingError = Schema.To<typeof ShardingErrorSchema>;
//# sourceMappingURL=index.d.ts.map