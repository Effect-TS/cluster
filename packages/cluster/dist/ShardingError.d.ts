import * as Schema from "@effect/schema/Schema";
export * from "@effect/cluster/ShardingErrorEntityNotManagedByThisPod";
export * from "@effect/cluster/ShardingErrorEntityTypeNotRegistered";
export * from "@effect/cluster/ShardingErrorMessageQueue";
export * from "@effect/cluster/ShardingErrorPodNoLongerRegistered";
export * from "@effect/cluster/ShardingErrorPodUnavailable";
export * from "@effect/cluster/ShardingErrorSendTimeout";
export * from "@effect/cluster/ShardingErrorSerialization";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _tag: "@effect/cluster/ShardingErrorEntityNotManagedByThisPod";
    readonly entityId: string;
} | {
    readonly _tag: "@effect/cluster/ShardingErrorEntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: {
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/cluster/ShardingErrorMessageQueue";
    readonly error: string;
} | {
    readonly _tag: "@effect/cluster/ShardingErrorPodNoLongerRegistered";
    readonly podAddress: {
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/cluster/ShardingErrorPodUnavailable";
    readonly pod: {
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/cluster/ShardingErrorSendTimeout";
} | {
    readonly _tag: "@effect/cluster/ShardingErrorSerialization";
    readonly error: string;
}, import("@effect/cluster/ShardingErrorEntityNotManagedByThisPod").ShardingErrorEntityNotManagedByThisPod | import("@effect/cluster/ShardingErrorEntityTypeNotRegistered").ShardingErrorEntityTypeNotRegistered | import("@effect/cluster/ShardingErrorMessageQueue").ShardingErrorMessageQueue | import("@effect/cluster/ShardingErrorPodNoLongerRegistered").ShardingErrorPodNoLongerRegistered | import("@effect/cluster/ShardingErrorPodUnavailable").ShardingErrorPodUnavailable | import("@effect/cluster/ShardingErrorSendTimeout").ShardingErrorSendTimeout | import("@effect/cluster/ShardingErrorSerialization").ShardingErrorSerialization>;
/**
 * @since 1.0.0
 * @category models
 */
export type ShardingError = Schema.Schema.To<typeof schema>;
//# sourceMappingURL=ShardingError.d.ts.map