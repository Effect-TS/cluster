import * as ShardingError from "@effect/cluster/ShardingError";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const AssignShard_: Schema.Schema<{
    readonly shards: readonly {
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }[];
}, {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }>[];
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const UnassignShards_: Schema.Schema<{
    readonly shards: readonly {
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }[];
}, {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }>[];
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const Send_: Schema.Schema<{
    readonly message: {
        readonly _id: "@effect/cluster/SerializedEnvelope";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: {
            readonly _id: "@effect/cluster/SerializedMessage";
            readonly value: string;
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly _id: "@effect/cluster/ReplyId";
                readonly value: string;
            };
        };
    };
}, {
    readonly message: import("effect/Data").Data<{
        readonly _id: "@effect/cluster/SerializedEnvelope";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: import("effect/Data").Data<{
            readonly _id: "@effect/cluster/SerializedMessage";
            readonly value: string;
        }>;
        readonly replyId: import("effect/Option").Option<import("effect/Data").Data<{
            readonly _id: "@effect/cluster/ReplyId";
            readonly value: string;
        }>>;
    }>;
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const SendResult_: Schema.Schema<{
    readonly _tag: "Left";
    readonly left: {
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
        /**
         * This is the schema for the protocol.
         *
         * @since 1.0.0
         * @category schema
         */
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
    };
} | {
    readonly _tag: "Right";
    readonly right: {
        readonly _tag: "None";
    } | {
        readonly _tag: "Some";
        readonly value: {
            /**
             * @since 1.0.0
             * @category schema
             */
            readonly _id: "@effect/cluster/SerializedMessage";
            readonly value: string;
        };
    };
}, import("effect/Either").Either<ShardingError.ShardingErrorEntityNotManagedByThisPod | ShardingError.ShardingErrorEntityTypeNotRegistered | ShardingError.ShardingErrorMessageQueue | ShardingError.ShardingErrorPodNoLongerRegistered | ShardingError.ShardingErrorPodUnavailable | ShardingError.ShardingErrorSendTimeout | ShardingError.ShardingErrorSerialization, import("effect/Option").Option<import("effect/Data").Data<{
    readonly _id: "@effect/cluster/SerializedMessage";
    readonly value: string;
}>>>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const PingShards_: Schema.Schema<{}, {}>;
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly shards: readonly {
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }[];
} | {
    readonly shards: readonly {
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }[];
} | {
    readonly message: {
        readonly _id: "@effect/cluster/SerializedEnvelope";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: {
            readonly _id: "@effect/cluster/SerializedMessage";
            readonly value: string;
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly _id: "@effect/cluster/ReplyId";
                readonly value: string;
            };
        };
    };
} | {}, {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }>[];
} | {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/cluster/ShardId";
        readonly value: number;
    }>[];
} | {
    readonly message: import("effect/Data").Data<{
        readonly _id: "@effect/cluster/SerializedEnvelope";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: import("effect/Data").Data<{
            readonly _id: "@effect/cluster/SerializedMessage";
            readonly value: string;
        }>;
        readonly replyId: import("effect/Option").Option<import("effect/Data").Data<{
            readonly _id: "@effect/cluster/ReplyId";
            readonly value: string;
        }>>;
    }>;
} | {}>;
//# sourceMappingURL=ShardingProtocolHttp.d.ts.map