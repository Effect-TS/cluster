import * as Data from "@effect/data/Data";
import { pipe } from "@effect/data/Function";
import * as Request from "@effect/io/Request";
import * as Schema from "@effect/schema/Schema";
import * as Option from "@effect/data/Option";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Parser from "@effect/schema/Parser";
import * as Replier from "./Replier";
import * as ReplyId from "./ReplyId";

export const MessageSuccessSchema = Symbol.for("@effect/shardcake/Message/SuccessSchema");

/**
 * @since 1.0.0
 * @category symbols
 */
export const MessageTypeId: unique symbol = Symbol.for("@effect/shardcake/Message");

/**
 * @since 1.0.0
 * @category symbol
 */
export type MessageTypeId = typeof MessageTypeId;
/**
 * A `Message<E, A>` is a request from a data source for a value of type `A`
 * that may fail with an `E`.
 *
 * @since 1.0.0
 * @category models
 */
export interface Message<A> {
  readonly replier: Replier.Replier<A>;
}

export type Success<A> = A extends Message<infer X> ? X : never;

export function isMessage<R>(value: unknown): value is Message<R> {
  return (
    typeof value === "object" &&
    value !== null &&
    "replier" in value &&
    Replier.isReplier(value.replier)
  );
}

export function schema<A>(success: Schema.Schema<A>) {
  return function <I extends object>(item: Schema.Schema<I>) {
    const result = pipe(item, Schema.extend(Schema.struct({ replier: Replier.schema(success) })));

    const make =
      (arg: I) =>
      (replyId: ReplyId.ReplyId): I & Message<A> =>
        Data.struct({ ...arg, replier: Replier.replier(replyId, success) });

    return [result, make] as const;
  };
}