/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as PodAddress from "@effect/shardcake/PodAddress"
import type * as RecipentType from "@effect/shardcake/RecipientType"

/** @internal */
export interface DecodeError {
  _tag: "DecodeError"
  error: unknown
}

/** @internal */
export function DecodeError(error: unknown): DecodeError {
  return {
    _tag: "DecodeError",
    error
  }
}

/** @internal */
export interface EncodeError {
  _tag: "EncodeError"
  error: unknown
}

/** @internal */
export function EncodeError(error: unknown): EncodeError {
  return {
    _tag: "EncodeError",
    error
  }
}

/** @internal */
export interface ReplyFailure {
  _tag: "ReplyFailure"
  error: unknown
}

/** @internal */
export function ReplyFailure(error: unknown): ReplyFailure {
  return {
    _tag: "ReplyFailure",
    error
  }
}

/** @internal */
export interface SendError {
  _tag: "SendError"
}

/** @internal */
export function SendError(): SendError {
  return { _tag: "SendError" }
}

/** @internal */
export interface SendTimeoutException<A> {
  _tag: "SendTimeoutException"
  entityType: RecipentType.RecipientType<A>
  entityId: String
  body: A
}

/** @internal */
export function SendTimeoutException<A>(
  entityType: RecipentType.RecipientType<A>,
  entityId: String,
  body: A
): SendTimeoutException<A> {
  return { _tag: "SendTimeoutException", entityId, entityType, body }
}

/** @internal */
export interface EntityNotManagedByThisPod {
  _tag: "EntityNotManagedByThisPod"
  entityId: string
}

/** @internal */
export function EntityNotManagedByThisPod(entityId: string): EntityNotManagedByThisPod {
  return { _tag: "EntityNotManagedByThisPod", entityId }
}

/** @internal */
export function isEntityNotManagedByThisPodError(value: any): value is EntityNotManagedByThisPod {
  return value && "_tag" in value && value._tag === "EntityNotManagedByThisPod"
}

/** @internal */
export interface PodUnavailable {
  _tag: "PodUnavailable"
  pod: PodAddress.PodAddress
}

/** @internal */
export function PodUnavailable(pod: PodAddress.PodAddress): PodUnavailable {
  return { _tag: "PodUnavailable", pod }
}

/** @internal */
export function isPodUnavailableError(value: any): value is PodUnavailable {
  return value && "_tag" in value && value._tag === "PodUnavailable"
}

/** @internal */
export const EntityTypeNotRegistered_ = (
  Schema.struct({
    _tag: Schema.literal("EntityTypeNotRegistered"),
    entityType: Schema.string,
    podAddress: PodAddress.schema
  })
)

/** @internal */
export interface EntityTypeNotRegistered extends Schema.To<typeof EntityTypeNotRegistered_> {}

/** @internal */
export function EntityTypeNotRegistered(
  entityType: string,
  podAddress: PodAddress.PodAddress
): EntityTypeNotRegistered {
  return ({ _tag: "EntityTypeNotRegistered", entityType, podAddress })
}

/** @internal */
export interface MessageReturnedNoting {
  _tag: "MessageReturnedNoting"
  entityId: string
  msg: any
}

/** @internal */
export function MessageReturnedNoting<A>(entityId: string, msg: A): MessageReturnedNoting {
  return { _tag: "MessageReturnedNoting", entityId, msg }
}

/** @internal */
export interface PodNoLongerRegistered {
  _tag: "PodNoLongerRegistered"
  pod: PodAddress.PodAddress
}

/** @internal */
export function PodNoLongerRegistered(pod: PodAddress.PodAddress): PodNoLongerRegistered {
  return { _tag: "PodNoLongerRegistered", pod }
}

/** @internal */
export interface NotAMessageWithReplier {
  _tag: "NotAMessageWithReplier"
  value: unknown
}

/** @internal */
export function NotAMessageWithReplier(value: unknown) {
  return { _tag: "NotAMessageWithReplier", value }
}

/** @internal */
export interface FetchError {
  _tag: "@effect/shardcake/FetchError"
  url: string
  body: string
  error: unknown
}

/** @internal */
export function FetchError(url: string, body: string, error: unknown): FetchError {
  return { _tag: "@effect/shardcake/FetchError", url, body, error }
}

/** @internal */
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
