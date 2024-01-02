import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import type * as MessageState from "../MessageState.js"

/** @internal */
const MessageStateSymbolKey = "@effect/cluster/MessageState"

/** @internal */
export const MessageStateTypeId: MessageState.MessageStateTypeId = Symbol.for(
  MessageStateSymbolKey
) as MessageState.MessageStateTypeId

/** @internal */
export function isMessageState(value: unknown): value is MessageState.MessageState<unknown> {
  return typeof value === "object" && value !== null && MessageStateTypeId in value
}

/** @internal */
export const Acknowledged: MessageState.MessageStateAcknowledged = {
  [MessageStateTypeId]: MessageStateTypeId,
  _tag: "@effect/cluster/MessageState/Acknowledged"
}

/** @internal */
export function Processed<A>(result: Option.Option<A>): MessageState.MessageStateProcessed<A> {
  return ({
    [MessageStateTypeId]: MessageStateTypeId,
    _tag: "@effect/cluster/MessageState/Processed",
    result
  })
}

/** @internal */
export function match<A, B, C = B>(
  cases: {
    onAcknowledged: (value: MessageState.MessageStateAcknowledged) => B
    onProcessed: (exit: MessageState.MessageStateProcessed<A>) => C
  }
) {
  return (value: MessageState.MessageState<A>) => {
    switch (value._tag) {
      case "@effect/cluster/MessageState/Acknowledged":
        return cases.onAcknowledged(value)
      case "@effect/cluster/MessageState/Processed":
        return cases.onProcessed(value)
    }
  }
}

/** @internal */
export function mapEffect<A, B, R, E>(
  value: MessageState.MessageState<A>,
  fn: (value: A) => Effect.Effect<R, E, B>
): Effect.Effect<R, E, MessageState.MessageState<B>> {
  return pipe(
    value,
    match({
      onAcknowledged: Effect.succeed,
      onProcessed: (_) =>
        pipe(
          _.result,
          Option.match({
            onNone: () => Effect.succeed(Processed(Option.none())) as Effect.Effect<R, E, MessageState.MessageState<B>>,
            onSome: (_) =>
              Effect.map(fn(_), (_) => Processed(Option.some(_))) as Effect.Effect<R, E, MessageState.MessageState<B>>
          })
        )
    })
  )
}

/** @internal */
export function schema<I, A>(
  result: Schema.Schema<I, A>
): Schema.Schema<
  MessageState.MessageState.From<I>,
  MessageState.MessageState<A>
> {
  return Schema.union(
    Schema.rename(
      Schema.struct({
        [MessageStateSymbolKey]: Schema.compose(
          Schema.compose(Schema.literal(MessageStateSymbolKey), Schema.symbol),
          Schema.uniqueSymbol(MessageStateTypeId)
        ),
        _tag: Schema.literal("@effect/cluster/MessageState/Acknowledged")
      }),
      { [MessageStateSymbolKey]: MessageStateTypeId }
    ),
    Schema.rename(
      Schema.struct({
        [MessageStateSymbolKey]: Schema.compose(
          Schema.compose(Schema.literal(MessageStateSymbolKey), Schema.symbol),
          Schema.uniqueSymbol(MessageStateTypeId)
        ),
        _tag: Schema.literal("@effect/cluster/MessageState/Processed"),
        result: Schema.option(result)
      }),
      { [MessageStateSymbolKey]: MessageStateTypeId }
    )
  )
}
