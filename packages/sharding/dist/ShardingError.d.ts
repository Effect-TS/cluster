/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
export * from "@effect/sharding/ShardingErrorEntityNotManagedByThisPod";
export * from "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
export * from "@effect/sharding/ShardingErrorMessageQueue";
export * from "@effect/sharding/ShardingErrorPodNoLongerRegistered";
export * from "@effect/sharding/ShardingErrorPodUnavailable";
export * from "@effect/sharding/ShardingErrorSendTimeout";
export * from "@effect/sharding/ShardingErrorSerialization";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _tag: "@effect/sharding/ShardingErrorSerialization";
    readonly error: string;
} | {
    readonly _tag: "@effect/sharding/ShardingErrorEntityNotManagedByThisPod";
    readonly entityId: string;
} | {
    readonly _tag: "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/sharding/ShardingErrorMessageQueue";
    readonly error: string;
} | {
    readonly _tag: "@effect/sharding/ShardingErrorPodNoLongerRegistered";
    readonly podAddress: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/sharding/ShardingErrorPodUnavailable";
    readonly pod: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "@effect/sharding/ShardingErrorSendTimeout";
}, import("@effect/sharding/ShardingErrorSerialization").ShardingErrorSerialization | import("@effect/sharding/ShardingErrorEntityNotManagedByThisPod").ShardingErrorEntityNotManagedByThisPod | import("@effect/sharding/ShardingErrorEntityTypeNotRegistered").ShardingErrorEntityTypeNotRegistered | import("@effect/sharding/ShardingErrorMessageQueue").ShardingErrorMessageQueue | import("@effect/sharding/ShardingErrorPodNoLongerRegistered").ShardingErrorPodNoLongerRegistered | import("@effect/sharding/ShardingErrorPodUnavailable").ShardingErrorPodUnavailable | import("@effect/sharding/ShardingErrorSendTimeout").ShardingErrorSendTimeout>;
/**
 * @since 1.0.0
 * @category models
 */
export type ShardingError = Schema.To<typeof schema>;
//# sourceMappingURL=ShardingError.d.ts.map