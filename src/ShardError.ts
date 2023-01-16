import { PodAddress } from "./PodAddress";
import { EntityType } from "./RecipientType";

export interface DecodeError {
  _tag: "DecodeError";
  error: unknown;
}
export function DecodeError(error: unknown): DecodeError {
  return {
    _tag: "DecodeError",
    error,
  };
}

export interface ReplyFailure {
  _tag: "ReplyFailure";
  error: unknown;
}
export function ReplyFailure(error: unknown): ReplyFailure {
  return {
    _tag: "ReplyFailure",
    error,
  };
}

export interface SendError {
  _tag: "SendError";
}
export function SendError(): SendError {
  return { _tag: "SendError" };
}

export interface SendTimeoutException<A> {
  _tag: "SendTimeoutException";
  entityType: EntityType<A>;
  entityId: String;
  body: A;
}
export function SendTimeoutException<A>(
  entityType: EntityType<A>,
  entityId: String,
  body: A
): SendTimeoutException<A> {
  return { _tag: "SendTimeoutException", entityId, entityType, body };
}

export interface EntityNotManagedByThisPod {
  _tag: "EntityNotManagedByThisPod";
}
export function EntityNotManagedByThisPod(): EntityNotManagedByThisPod {
  return { _tag: "EntityNotManagedByThisPod" };
}
export function isEntityNotManagedByThisPodError(value: any): value is EntityNotManagedByThisPod {
  return value && "_tag" in value && value._tag === "EntityNotManagedByThisPod";
}

export interface PodUnavailable {
  _tag: "PodUnavailable";
  pod: PodAddress;
}
export function PodUnavailable(pod: PodAddress): PodUnavailable {
  return { _tag: "PodUnavailable", pod };
}
export function isPodUnavailableError(value: any): value is PodUnavailable {
  return value && "_tag" in value && value._tag === "PodUnavailable";
}

export interface EntityTypeNotRegistered {
  _tag: "EntityTypeNotRegistered";
  entityType: string;
}
export function EntityTypeNotRegistered(entityType: string): EntityTypeNotRegistered {
  return { _tag: "EntityTypeNotRegistered", entityType };
}

export interface MessageReturnedNoting {
  _tag: "MessageReturnedNoting";
  entityId: string;
  msg: any;
}
export function MessageReturnedNoting<A>(entityId: string, msg: A): MessageReturnedNoting {
  return { _tag: "MessageReturnedNoting", entityId, msg };
}

export type Throwable =
  | DecodeError
  | ReplyFailure
  | SendError
  | SendTimeoutException<any>
  | EntityNotManagedByThisPod
  | PodUnavailable
  | EntityTypeNotRegistered
  | MessageReturnedNoting;
