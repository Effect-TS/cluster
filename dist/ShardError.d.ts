/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/shardcake/PodAddress";
import type * as RecipentType from "@effect/shardcake/RecipientType";
/**
 * @since 1.0.0
 * @category models
 */
export interface DecodeError {
    _tag: "DecodeError";
    error: unknown;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function DecodeError(error: unknown): DecodeError;
/**
 * @since 1.0.0
 * @category models
 */
export interface EncodeError {
    _tag: "EncodeError";
    error: unknown;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function EncodeError(error: unknown): EncodeError;
/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyFailure {
    _tag: "ReplyFailure";
    error: unknown;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ReplyFailure(error: unknown): ReplyFailure;
/**
 * @since 1.0.0
 * @category models
 */
export interface SendError {
    _tag: "SendError";
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function SendError(): SendError;
/**
 * @since 1.0.0
 * @category models
 */
export interface SendTimeoutException<A> {
    _tag: "SendTimeoutException";
    entityType: RecipentType.RecipientType<A>;
    entityId: String;
    body: A;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function SendTimeoutException<A>(entityType: RecipentType.RecipientType<A>, entityId: String, body: A): SendTimeoutException<A>;
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityNotManagedByThisPod {
    _tag: "EntityNotManagedByThisPod";
    entityId: string;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function EntityNotManagedByThisPod(entityId: string): EntityNotManagedByThisPod;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isEntityNotManagedByThisPodError(value: any): value is EntityNotManagedByThisPod;
/**
 * @since 1.0.0
 * @category models
 */
export interface PodUnavailable {
    _tag: "PodUnavailable";
    pod: PodAddress.PodAddress;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function PodUnavailable(pod: PodAddress.PodAddress): PodUnavailable;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isPodUnavailableError(value: any): value is PodUnavailable;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const EntityTypeNotRegistered_: Schema.Schema<{
    readonly _tag: "EntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, {
    readonly _tag: "EntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: import("@effect/data/Data").Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>;
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityTypeNotRegistered extends Schema.To<typeof EntityTypeNotRegistered_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function EntityTypeNotRegistered(entityType: string, podAddress: PodAddress.PodAddress): EntityTypeNotRegistered;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function isEntityTypeNotRegistered(value: unknown): value is EntityTypeNotRegistered;
/**
 * @since 1.0.0
 * @category models
 */
export interface MessageReturnedNoting {
    _tag: "MessageReturnedNoting";
    entityId: string;
    msg: any;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function MessageReturnedNoting<A>(entityId: string, msg: A): MessageReturnedNoting;
/**
 * @since 1.0.0
 * @category models
 */
export interface PodNoLongerRegistered {
    _tag: "PodNoLongerRegistered";
    pod: PodAddress.PodAddress;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function PodNoLongerRegistered(pod: PodAddress.PodAddress): PodNoLongerRegistered;
/**
 * @since 1.0.0
 * @category models
 */
export interface NotAMessageWithReplier {
    _tag: "NotAMessageWithReplier";
    value: unknown;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function NotAMessageWithReplier(value: unknown): {
    _tag: string;
    value: unknown;
};
/**
 * @since 1.0.0
 * @category models
 */
export interface FetchError {
    _tag: "@effect/shardcake/FetchError";
    url: string;
    body: string;
    error: unknown;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function FetchError(url: string, body: string, error: unknown): FetchError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isFetchError(value: unknown): value is FetchError;
/**
 * @since 1.0.0
 * @category schema
 */
export type Throwable = DecodeError | EncodeError | ReplyFailure | SendError | SendTimeoutException<any> | EntityNotManagedByThisPod | PodUnavailable | EntityTypeNotRegistered | MessageReturnedNoting | PodNoLongerRegistered | FetchError;
//# sourceMappingURL=ShardError.d.ts.map