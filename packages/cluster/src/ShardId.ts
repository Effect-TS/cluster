/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Data from "effect/Data"
import * as internal from "./internal/shardId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardIdTypeId: unique symbol = internal.ShardIdTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type ShardIdTypeId = typeof ShardIdTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardId extends
  Data.Data<{
    readonly [ShardIdTypeId]: ShardIdTypeId
    readonly value: number
  }>
{}
/**
 * @since 1.0.0
 * @category models
 */
export namespace ShardId {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface From extends Schema.Schema.From<typeof internal.schema> {}
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (value: number) => ShardId = internal.make

/** @internal */
export const show = internal.show

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  ShardId.From,
  ShardId
> = internal.schema
