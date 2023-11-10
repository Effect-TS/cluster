/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import { pipe } from "effect/Function"
import * as List from "effect/List"
import * as Option from "effect/Option"
import * as Pod from "./Pod.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/cluster/PodWithMetadata"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface PodWithMetadata extends Schema.Schema.To<typeof schema> {}

/**
 * @since 1.0.0
 * @category utils
 */
export function isPodWithMetadata(value: unknown): value is PodWithMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(pod: Pod.Pod, registered: number): PodWithMetadata {
  return Data.struct({ _id: TypeId, pod, registered })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function extractVersion(pod: PodWithMetadata): List.List<number> {
  return pipe(
    List.fromIterable(pod.pod.version.split(".")),
    List.map((_) => parseInt(_, 10))
  )
}

/**
 * @since 1.0.0
 * @category utils
 */
export function compareVersion(a: List.List<number>, b: List.List<number>): 0 | 1 | -1 {
  let restA = a
  let restB = b
  while (List.size(restA) > 0 || List.size(restB) > 0) {
    const numA = pipe(
      List.head(restA),
      Option.getOrElse(() => 0)
    )
    const numB = pipe(
      List.head(restB),
      Option.getOrElse(() => 0)
    )

    if (numA < numB) return -1
    if (numB > numA) return 1
    restA = pipe(
      List.tail(restA),
      Option.getOrElse(() => List.empty())
    )
    restB = pipe(
      List.tail(restB),
      Option.getOrElse(() => List.empty())
    )
  }
  return 0
}

/** @internal */
export function show(value: PodWithMetadata) {
  return "PodWithMetadata(pod=" + Pod.show(value.pod) + ", registered=" + value.registered + ")"
}

/**
 * @since 1.0.0
 * @category schema
 */
export const schema = pipe(
  Schema.struct({
    _id: Schema.literal(TypeId),
    pod: Pod.schema,
    registered: Schema.number
  }),
  Schema.data
)
