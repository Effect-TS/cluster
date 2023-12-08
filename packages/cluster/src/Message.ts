/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Serializable from "@effect/schema/Serializable"
import type * as Types from "effect/Types"
import * as internal from "./internal/message.js"

/**
 * A `Message<A>` is a request from a data source for a value of type `A`
 *
 * @since 1.0.0
 * @category models
 */
export interface Message<A> extends Serializable.WithResult<unknown, never, unknown, A> {
}

/**
 * A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageSchema<From, To, A> extends Schema.Schema<From, Types.Simplify<To & Message<A>>> {
  make: (message: To) => Types.Simplify<To & Message<A>>
}

/**
 * Extracts the success type from a `Message<A>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Success<A> = A extends Message<infer X> ? X : never

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessage: <R>(value: unknown) => value is Message<R> = internal.isMessage

/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: <RI, RA>(
  replySchema: Schema.Schema<RI, RA>
) => <I extends object, A extends object>(item: Schema.Schema<I, A>) => MessageSchema<I, A, RA> = internal.schema

/**
 * Returns the schema for the successful reply of a Message<A>
 */
export const successSchema: <A>(message: Message<A>) => Schema.Schema<unknown, A> = internal.successSchema
