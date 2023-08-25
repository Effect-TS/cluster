import * as Schema from "@effect/schema/Schema";
export * from "@effect/shardcake/ShardingError/ShardingDecodeError";
export * from "@effect/shardcake/ShardingError/ShardingEncodeError";
export * from "@effect/shardcake/ShardingError/ShardingEntityNotManagedByThisPodError";
export * from "@effect/shardcake/ShardingError/ShardingEntityTypeNotRegisteredError";
export * from "@effect/shardcake/ShardingError/ShardingMessageQueueOfferError";
export * from "@effect/shardcake/ShardingError/ShardingPodNoLongerRegisteredError";
export * from "@effect/shardcake/ShardingError/ShardingPodUnavailableError";
export * from "@effect/shardcake/ShardingError/ShardingReplyError";
export * from "@effect/shardcake/ShardingError/ShardingSendError";
export * from "@effect/shardcake/ShardingError/ShardingSendTimeoutError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingEncodeError";
    readonly error: string;
} | {
    readonly _tag: "@effect/shardcake/ShardingDecodeError";
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
    readonly _tag: "@effect/shardcake/ShardingMessageQueueOfferError";
    readonly error: string;
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
    readonly _tag: "@effect/shardcake/ShardingReplyError";
    readonly error: string;
} | {
    readonly _tag: "@effect/shardcake/ShardingSendError";
    readonly error: string;
} | {
    readonly _tag: "@effect/shardcake/ShardingSendTimeoutError";
}, import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingEncodeError";
    readonly error: string;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingDecodeError";
    readonly error: string;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingEntityNotManagedByThisPodError";
    readonly entityId: string;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingEntityTypeNotRegisteredError";
    readonly entityType: string;
    readonly podAddress: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingMessageQueueOfferError";
    readonly error: string;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingPodNoLongerRegisteredError";
    readonly podAddress: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingPodUnavailableError";
    readonly pod: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingReplyError";
    readonly error: string;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingSendError";
    readonly error: string;
}> | import("@effect/data/Data").Data<{
    readonly _tag: "@effect/shardcake/ShardingSendTimeoutError";
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export type ShardingError = Schema.To<typeof ShardingErrorSchema>;
//# sourceMappingURL=index.d.ts.map