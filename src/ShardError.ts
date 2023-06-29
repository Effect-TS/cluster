import * as Schema from "@effect/schema/Schema"
import * as PodAddress from "@effect/shardcake/PodAddress"
import type { EntityType } from "@effect/shardcake/RecipientType"

export interface DecodeError {
  _tag: "DecodeError"
  error: unknown
}
export function DecodeError(error: unknown): DecodeError {
  return {
    _tag: "DecodeError",
    error
  }
}

export interface EncodeError {
  _tag: "EncodeError"
  error: unknown
}
export function EncodeError(error: unknown): EncodeError {
  return {
    _tag: "EncodeError",
    error
  }
}

export interface ReplyFailure {
  _tag: "ReplyFailure"
  error: unknown
}
export function ReplyFailure(error: unknown): ReplyFailure {
  return {
    _tag: "ReplyFailure",
    error
  }
}

export interface SendError {
  _tag: "SendError"
}
export function SendError(): SendError {
  return { _tag: "SendError" }
}

export interface SendTimeoutException<A> {
  _tag: "SendTimeoutException"
  entityType: EntityType<A>
  entityId: String
  body: A
}
export function SendTimeoutException<A>(
  entityType: EntityType<A>,
  entityId: String,
  body: A
): SendTimeoutException<A> {
  return { _tag: "SendTimeoutException", entityId, entityType, body }
}

export interface EntityNotManagedByThisPod {
  _tag: "EntityNotManagedByThisPod"
  entityId: string
}
export function EntityNotManagedByThisPod(entityId: string): EntityNotManagedByThisPod {
  return { _tag: "EntityNotManagedByThisPod", entityId }
}
export function isEntityNotManagedByThisPodError(value: any): value is EntityNotManagedByThisPod {
  return value && "_tag" in value && value._tag === "EntityNotManagedByThisPod"
}

export interface PodUnavailable {
  _tag: "PodUnavailable"
  pod: PodAddress.PodAddress
}
export function PodUnavailable(pod: PodAddress.PodAddress): PodUnavailable {
  return { _tag: "PodUnavailable", pod }
}
export function isPodUnavailableError(value: any): value is PodUnavailable {
  return value && "_tag" in value && value._tag === "PodUnavailable"
}

export const EntityTypeNotRegistered_ = (
  Schema.struct({
    _tag: Schema.literal("EntityTypeNotRegistered"),
    entityType: Schema.string,
    podAddress: PodAddress.schema
  })
)
export interface EntityTypeNotRegistered extends Schema.To<typeof EntityTypeNotRegistered_> {}

export function EntityTypeNotRegistered(
  entityType: string,
  podAddress: PodAddress.PodAddress
): EntityTypeNotRegistered {
  return ({ _tag: "EntityTypeNotRegistered", entityType, podAddress })
}

export interface MessageReturnedNoting {
  _tag: "MessageReturnedNoting"
  entityId: string
  msg: any
}
export function MessageReturnedNoting<A>(entityId: string, msg: A): MessageReturnedNoting {
  return { _tag: "MessageReturnedNoting", entityId, msg }
}

export interface PodNoLongerRegistered {
  _tag: "PodNoLongerRegistered"
  pod: PodAddress.PodAddress
}
export function PodNoLongerRegistered(pod: PodAddress.PodAddress): PodNoLongerRegistered {
  return { _tag: "PodNoLongerRegistered", pod }
}

export interface NotAMessageWithReplier {
  _tag: "NotAMessageWithReplier"
  value: unknown
}

export function NotAMessageWithReplier(value: unknown) {
  return { _tag: "NotAMessageWithReplier", value }
}

export interface FetchError {
  _tag: "@effect/shardcake/FetchError"
  url: string
  body: string
  error: unknown
}

export function FetchError(url: string, body: string, error: unknown): FetchError {
  return { _tag: "@effect/shardcake/FetchError", url, body, error }
}

export function isFetchError(value: unknown): value is FetchError {
  return (
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    value["_tag"] === "@effect/shardcake/FetchError"
  )
}

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

export type WireThrowable = DecodeError | EncodeError | FetchError
