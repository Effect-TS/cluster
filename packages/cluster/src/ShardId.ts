/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import { TypeIdSchema } from "./internal/utils.js"

/** @internal */
const ShardIdSymbolKey = "@effect/cluster/ShardId"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardIdTypeId: unique symbol = Symbol.for(ShardIdSymbolKey)

/**
 * @since 1.0.0
 * @category symbols
 */
export type ShardIdTypeId = typeof ShardIdTypeId

/** @internal */
const ShardIdTypeIdSchema = TypeIdSchema(ShardIdSymbolKey, ShardIdTypeId)

/**
 * @since 1.0.0
 * @category models
 */
export class ShardId extends Schema.Class<ShardId>(ShardIdSymbolKey)({
  [ShardIdTypeId]: Schema.propertySignature(ShardIdTypeIdSchema).pipe(Schema.fromKey(ShardIdSymbolKey)),
  value: Schema.Number
}) {
  /**
   * @since 1.0.0
   */
  toString() {
    return `ShardId(${this.value})`
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export namespace ShardId {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Encoded extends Schema.Schema.Encoded<typeof ShardId> {}
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(value: number): ShardId {
  return new ShardId({ [ShardIdTypeId]: ShardIdTypeId, value })
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  ShardId,
  ShardId.Encoded
> = Schema.asSchema(ShardId)
