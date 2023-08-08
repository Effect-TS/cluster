/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const Register_: Schema.Schema<{
    readonly _tag: "Register";
    readonly pod: {
        readonly _id: "@effect/shardcake/Pod";
        readonly address: {
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        };
        readonly version: string;
    };
}, {
    readonly _tag: "Register";
    readonly pod: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/Pod";
        readonly address: import("@effect/data/Data").Data<{
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        }>;
        readonly version: string;
    }>;
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const RegisterResult_: Schema.Schema<{
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
export declare const Unregister_: Schema.Schema<{
    readonly _tag: "Unregister";
    readonly pod: {
        readonly _id: "@effect/shardcake/Pod";
        readonly address: {
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        };
        readonly version: string;
    };
}, {
    readonly _tag: "Unregister";
    readonly pod: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/Pod";
        readonly address: import("@effect/data/Data").Data<{
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        }>;
        readonly version: string;
    }>;
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const UnregisterResult_: Schema.Schema<{
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
export declare const NotifyUnhealthyPod_: Schema.Schema<{
    readonly _tag: "NotifyUnhealthyPod";
    readonly podAddress: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, {
    readonly _tag: "NotifyUnhealthyPod";
    readonly podAddress: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const NotifyUnhealthyPodResult_: Schema.Schema<{
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
export declare const GetAssignments_: Schema.Schema<{
    readonly _tag: "GetAssignments";
}, {
    readonly _tag: "GetAssignments";
}>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const GetAssignmentsResult_: Schema.Schema<{
    readonly _tag: "Left";
    readonly left: never;
} | {
    readonly _tag: "Right";
    readonly right: readonly (readonly [{
        readonly value: number;
        readonly _id: "@effect/shardcake/ShardId";
    }, {
        readonly _tag: "None";
    } | {
        readonly _tag: "Some";
        readonly value: {
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        };
    }])[];
}, import("@effect/data/Either").Either<never, readonly (readonly [import("@effect/data/Data").Data<{
    readonly value: number;
    readonly _id: "@effect/shardcake/ShardId";
}>, import("@effect/data/Option").Option<import("@effect/data/Data").Data<{
    readonly _id: "@effect/shardcake/PodAddress";
    readonly host: string;
    readonly port: number;
}>>])[]>>;
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _tag: "Register";
    readonly pod: {
        readonly _id: "@effect/shardcake/Pod";
        readonly address: {
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        };
        readonly version: string;
    };
} | {
    readonly _tag: "Unregister";
    readonly pod: {
        readonly _id: "@effect/shardcake/Pod";
        readonly address: {
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        };
        readonly version: string;
    };
} | {
    readonly _tag: "NotifyUnhealthyPod";
    readonly podAddress: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
} | {
    readonly _tag: "GetAssignments";
}, {
    readonly _tag: "Register";
    readonly pod: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/Pod";
        readonly address: import("@effect/data/Data").Data<{
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        }>;
        readonly version: string;
    }>;
} | {
    readonly _tag: "Unregister";
    readonly pod: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/Pod";
        readonly address: import("@effect/data/Data").Data<{
            readonly _id: "@effect/shardcake/PodAddress";
            readonly host: string;
            readonly port: number;
        }>;
        readonly version: string;
    }>;
} | {
    readonly _tag: "NotifyUnhealthyPod";
    readonly podAddress: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
} | {
    readonly _tag: "GetAssignments";
}>;
//# sourceMappingURL=ShardManagerProtocolHttp.d.ts.map