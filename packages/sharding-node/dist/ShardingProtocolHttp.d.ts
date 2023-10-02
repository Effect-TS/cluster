/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as ShardingError from "@effect/sharding/ShardingError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const AssignShard_: Schema.Schema<{
    readonly shards: readonly {
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }[];
}, {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }>[];
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const UnassignShards_: Schema.Schema<{
    readonly shards: readonly {
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }[];
}, {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }>[];
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const Send_: Schema.Schema<{
    readonly message: {
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: {
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly _id: "@effect/sharding/ReplyId";
                readonly value: string;
            };
        };
    };
}, {
    readonly message: import("effect/Data").Data<{
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        }>;
        readonly replyId: import("effect/Option").Option<import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ReplyId";
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
        readonly entityId: string;
        readonly _tag: "@effect/sharding/ShardingErrorEntityNotManagedByThisPod";
    } | {
        readonly entityType: string;
        readonly _tag: "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
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
    } | {
        readonly _tag: "@effect/sharding/ShardingErrorSerialization";
        readonly error: string;
    };
} | {
    readonly _tag: "Right";
    readonly right: {
        readonly _tag: "None";
    } | {
        readonly _tag: "Some";
        readonly value: {
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        };
    };
}, import("effect/Either").Either<ShardingError.ShardingErrorEntityNotManagedByThisPod | ShardingError.ShardingErrorEntityTypeNotRegistered | ShardingError.ShardingErrorMessageQueue | ShardingError.ShardingErrorPodNoLongerRegistered | ShardingError.ShardingErrorPodUnavailable | ShardingError.ShardingErrorSendTimeout | ShardingError.ShardingErrorSerialization, import("effect/Option").Option<import("effect/Data").Data<{
    readonly _id: "@effect/sharding/ByteArray";
    readonly value: string;
}>>>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const SendStream_: Schema.Schema<{
    readonly message: {
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: {
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly _id: "@effect/sharding/ReplyId";
                readonly value: string;
            };
        };
    };
}, {
    readonly message: import("effect/Data").Data<{
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        }>;
        readonly replyId: import("effect/Option").Option<import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ReplyId";
            readonly value: string;
        }>>;
    }>;
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const SendStreamResultItem_: Schema.Schema<{
    readonly _tag: "Left";
    readonly left: {
        readonly entityId: string;
        readonly _tag: "@effect/sharding/ShardingErrorEntityNotManagedByThisPod";
    } | {
        readonly entityType: string;
        readonly _tag: "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
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
    } | {
        readonly _tag: "@effect/sharding/ShardingErrorSerialization";
        readonly error: string;
    };
} | {
    readonly _tag: "Right";
    readonly right: {
        readonly _id: "@effect/sharding/ByteArray";
        readonly value: string;
    };
}, import("effect/Either").Either<ShardingError.ShardingErrorEntityNotManagedByThisPod | ShardingError.ShardingErrorEntityTypeNotRegistered | ShardingError.ShardingErrorMessageQueue | ShardingError.ShardingErrorPodNoLongerRegistered | ShardingError.ShardingErrorPodUnavailable | ShardingError.ShardingErrorSendTimeout | ShardingError.ShardingErrorSerialization, import("effect/Data").Data<{
    readonly _id: "@effect/sharding/ByteArray";
    readonly value: string;
}>>>;
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
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }[];
} | {
    readonly shards: readonly {
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }[];
} | {
    readonly message: {
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: {
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly _id: "@effect/sharding/ReplyId";
                readonly value: string;
            };
        };
    };
} | {
    readonly message: {
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: {
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly _id: "@effect/sharding/ReplyId";
                readonly value: string;
            };
        };
    };
} | {}, {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }>[];
} | {
    readonly shards: readonly import("effect/Data").Data<{
        readonly _id: "@effect/sharding/ShardId";
        readonly value: number;
    }>[];
} | {
    readonly message: import("effect/Data").Data<{
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        }>;
        readonly replyId: import("effect/Option").Option<import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ReplyId";
            readonly value: string;
        }>>;
    }>;
} | {
    readonly message: import("effect/Data").Data<{
        readonly _id: "@effect/sharding/BinaryMessage";
        readonly entityId: string;
        readonly entityType: string;
        readonly body: import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ByteArray";
            readonly value: string;
        }>;
        readonly replyId: import("effect/Option").Option<import("effect/Data").Data<{
            readonly _id: "@effect/sharding/ReplyId";
            readonly value: string;
        }>>;
    }>;
} | {}>;
//# sourceMappingURL=ShardingProtocolHttp.d.ts.map
