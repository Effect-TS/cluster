/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as PodAddress from "@effect/shardcake/PodAddress"
import type * as RecipentType from "@effect/shardcake/RecipientType"

/**
 * @since 1.0.0
 * @category models
 */
export interface DecodeError {
  _tag: "DecodeError"
  error: unknown
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function DecodeError(error: unknown): DecodeError {
  return {
    _tag: "DecodeError",
    error
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface EncodeError {
  _tag: "EncodeError"
  error: unknown
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function EncodeError(error: unknown): EncodeError {
  return {
    _tag: "EncodeError",
    error
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyFailure {
  _tag: "ReplyFailure"
  error: unknown
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ReplyFailure(error: unknown): ReplyFailure {
  return {
    _tag: "ReplyFailure",
    error
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface SendError {
  _tag: "SendError"
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function SendError(): SendError {
  return { _tag: "SendError" }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface SendTimeoutException<A> {
  _tag: "SendTimeoutException"
  entityType: RecipentType.RecipientType<A>
  entityId: String
  body: A
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function SendTimeoutException<A>(
  entityType: RecipentType.RecipientType<A>,
  entityId: String,
  body: A
): SendTimeoutException<A> {
  return { _tag: "SendTimeoutException", entityId, entityType, body }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityNotManagedByThisPod {
  _tag: "EntityNotManagedByThisPod"
  entityId: string
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function EntityNotManagedByThisPod(entityId: string): EntityNotManagedByThisPod {
  return { _tag: "EntityNotManagedByThisPod", entityId }
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isEntityNotManagedByThisPodError(value: any): value is EntityNotManagedByThisPod {
  return value && "_tag" in value && value._tag === "EntityNotManagedByThisPod"
}

/**
 * @since 1.0.0
 * @category models
 */
export interface PodUnavailable {
  _tag: "PodUnavailable"
  pod: PodAddress.PodAddress
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function PodUnavailable(pod: PodAddress.PodAddress): PodUnavailable {
  return { _tag: "PodUnavailable", pod }
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isPodUnavailableError(value: any): value is PodUnavailable {
  return value && "_tag" in value && value._tag === "PodUnavailable"
}

/**
 * @since 1.0.0
 * @category schema
 */
export const EntityTypeNotRegistered_ = (
  Schema.struct({
    _tag: Schema.literal("EntityTypeNotRegistered"),
    entityType: Schema.string,
    podAddress: PodAddress.schema
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityTypeNotRegistered extends Schema.To<typeof EntityTypeNotRegistered_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function EntityTypeNotRegistered(
  entityType: string,
  podAddress: PodAddress.PodAddress
): EntityTypeNotRegistered {
  return ({ _tag: "EntityTypeNotRegistered", entityType, podAddress })
}

export function isEntityTypeNotRegistered(value: unknown): value is EntityTypeNotRegistered {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "EntityTypeNotRegistered"
}

/**
 * @since 1.0.0
 * @category models
 */
export interface MessageReturnedNoting {
  _tag: "MessageReturnedNoting"
  entityId: string
  msg: any
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function MessageReturnedNoting<A>(entityId: string, msg: A): MessageReturnedNoting {
  return { _tag: "MessageReturnedNoting", entityId, msg }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface PodNoLongerRegistered {
  _tag: "PodNoLongerRegistered"
  pod: PodAddress.PodAddress
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function PodNoLongerRegistered(pod: PodAddress.PodAddress): PodNoLongerRegistered {
  return { _tag: "PodNoLongerRegistered", pod }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface NotAMessageWithReplier {
  _tag: "NotAMessageWithReplier"
  value: unknown
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function NotAMessageWithReplier(value: unknown) {
  return { _tag: "NotAMessageWithReplier", value }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface FetchError {
  _tag: "@effect/shardcake/FetchError"
  url: string
  body: string
  error: unknown
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function FetchError(url: string, body: string, error: unknown): FetchError {
  return { _tag: "@effect/shardcake/FetchError", url, body, error }
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isFetchError(value: unknown): value is FetchError {
  return (
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    value["_tag"] === "@effect/shardcake/FetchError"
  )
}

/**
 * @since 1.0.0
 * @category schema
 */
export type Throwable =
  | DecodeError
  | EncodeError
  | ReplyFailure
  | SendError
  | SendTimeoutException<any>
  | EntityNotManagedByThisPod
  | PodUnavailable
  | EntityTypeNotRegistered
  | MessageReturnedNoting
  | PodNoLongerRegistered
  | FetchError
