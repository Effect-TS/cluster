/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Serializable from "@effect/schema/Serializable"
import type * as Exit_ from "effect/Exit"
import * as internal from "./internal/message.js"

/**
 * A `Message<A>` is a request from a data source for a value of type `A`
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageWithResult<Failure, Success>
  extends Serializable.WithResult<never, any, Failure, any, Success>
{
}

/**
 * @since 1.0.0
 * @category models
 */
export namespace MessageWithResult {
  /**
   * @since 1.0.0
   * @category models
   */
  export type Any =
    | Serializable.WithResult<never, never, never, any, any>
    | Serializable.WithResult<never, any, any, any, any>

  /**
   * Extracts the success type from a `MessageWithResult<A, S>`.
   *
   * @since 1.0.0
   * @category utils
   */
  export type Success<S> = S extends MessageWithResult<any, infer X> ? X : never

  /**
   * Extracts the success type from a `MessageWithResult<A, S>`.
   *
   * @since 1.0.0
   * @category utils
   */
  export type Error<S> = S extends MessageWithResult<infer X, any> ? X : never

  /**
   * Extracts the success type from a `MessageWithResult<A, S>`.
   *
   * @since 1.0.0
   * @category utils
   */
  export type Exit<S> = S extends Serializable.WithResult<never, any, infer E, any, infer A> ? Exit_.Exit<A, E> :
    S extends Serializable.WithResult<never, never, infer E, any, infer A> ? Exit_.Exit<A, E>
    : never
}

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessageWithResult: (value: unknown) => value is MessageWithResult<unknown, unknown> =
  internal.isMessageWithResult

/**
 * @since 1.0.0
 * @category utils
 */
export const exitSchema: <A extends MessageWithResult.Any>(
  message: A
) => Schema.Schema<MessageWithResult.Exit<A>, unknown> = internal.exitSchema
