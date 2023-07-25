/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const AssignShard_: Schema.Schema<{
    readonly shards: readonly {
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }[];
    readonly _tag: "AssignShards";
}, {
    readonly shards: readonly import("@effect/data/Data").Data<{
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }>[];
    readonly _tag: "AssignShards";
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const AssignShardResult_: Schema.Schema<{
    readonly _tag: "Left";
    readonly left: never;
} | {
    readonly _tag: "Right";
    readonly right: boolean;
}, import("@effect/data/Either").Either<never, boolean>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const UnassignShards_: Schema.Schema<{
    readonly shards: readonly {
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }[];
    readonly _tag: "UnassignShards";
}, {
    readonly shards: readonly import("@effect/data/Data").Data<{
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }>[];
    readonly _tag: "UnassignShards";
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const UnassignShardsResult_: Schema.Schema<{
    readonly _tag: "Left";
    readonly left: never;
} | {
    readonly _tag: "Right";
    readonly right: boolean;
}, import("@effect/data/Either").Either<never, boolean>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const Send_: Schema.Schema<{
    readonly _tag: "Send";
    readonly message: {
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: {
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly value: string;
                readonly _id: "@effect/shardcake/ReplyId";
            };
        };
    };
}, {
    readonly _tag: "Send";
    readonly message: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        }>;
        readonly replyId: import("@effect/data/Option").Option<import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ReplyId";
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
        readonly _tag: "EntityTypeNotRegistered";
        readonly entityType: string;
        readonly podAddress: {
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        };
    };
} | {
    readonly _tag: "Right";
    readonly right: {
        readonly _tag: "None";
    } | {
        readonly _tag: "Some";
        readonly value: {
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        };
    };
}, import("@effect/data/Either").Either<{
    readonly _tag: "EntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}, import("@effect/data/Option").Option<import("@effect/data/Data").Data<{
    readonly value: string;
    readonly _id: "@effect/shardcake/ByteArray";
}>>>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const SendStream_: Schema.Schema<{
    readonly _tag: "SendStream";
    readonly message: {
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: {
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly value: string;
                readonly _id: "@effect/shardcake/ReplyId";
            };
        };
    };
}, {
    readonly _tag: "SendStream";
    readonly message: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        }>;
        readonly replyId: import("@effect/data/Option").Option<import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ReplyId";
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
        readonly _tag: "EntityTypeNotRegistered";
        readonly entityType: string;
        readonly podAddress: {
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        };
    };
} | {
    readonly _tag: "Right";
    readonly right: {
        readonly value: string;
        readonly _id: "@effect/shardcake/ByteArray";
    };
}, import("@effect/data/Either").Either<{
    readonly _tag: "EntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}, import("@effect/data/Data").Data<{
    readonly value: string;
    readonly _id: "@effect/shardcake/ByteArray";
}>>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const PingShards_: Schema.Schema<{
    readonly _tag: "PingShards";
}, {
    readonly _tag: "PingShards";
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const PingShardsResult_: Schema.Schema<{
    readonly _tag: "Left";
    readonly left: never;
} | {
    readonly _tag: "Right";
    readonly right: boolean;
}, import("@effect/data/Either").Either<never, boolean>>;
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly shards: readonly {
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }[];
    readonly _tag: "AssignShards";
} | {
    readonly shards: readonly {
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }[];
    readonly _tag: "UnassignShards";
} | {
    readonly _tag: "PingShards";
} | {
    readonly _tag: "Send";
    readonly message: {
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: {
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly value: string;
                readonly _id: "@effect/shardcake/ReplyId";
            };
        };
    };
} | {
    readonly _tag: "SendStream";
    readonly message: {
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: {
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        };
        readonly replyId: {
            readonly _tag: "None";
        } | {
            readonly _tag: "Some";
            readonly value: {
                readonly value: string;
                readonly _id: "@effect/shardcake/ReplyId";
            };
        };
    };
}, {
    readonly shards: readonly import("@effect/data/Data").Data<{
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }>[];
    readonly _tag: "AssignShards";
} | {
    readonly shards: readonly import("@effect/data/Data").Data<{
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }>[];
    readonly _tag: "UnassignShards";
} | {
    readonly _tag: "PingShards";
} | {
    readonly _tag: "Send";
    readonly message: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        }>;
        readonly replyId: import("@effect/data/Option").Option<import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ReplyId";
        }>>;
    }>;
} | {
    readonly _tag: "SendStream";
    readonly message: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/BinaryMessage";
        readonly entityType: string;
        readonly entityId: string;
        readonly body: import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ByteArray";
        }>;
        readonly replyId: import("@effect/data/Option").Option<import("@effect/data/Data").Data<{
            readonly value: string;
            readonly _id: "@effect/shardcake/ReplyId";
        }>>;
    }>;
}>;
//# sourceMappingURL=ShardingProtocolHttp.d.ts.map