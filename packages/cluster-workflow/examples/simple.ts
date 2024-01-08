import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Stream from "effect/Stream"

class TemporaryFailure extends Schema.TaggedClass<TemporaryFailure>()("TemporaryFailure", {}) {
}

const getAmountDue = (orderId: string) =>
  pipe(
    Effect.sync(() => Math.round(Math.random() * 100) / 2),
    Workflow.step("get-amount-due-" + orderId, Schema.never, Schema.number)
  )

const processPayment = (billingAddress: string, amountDue: number) =>
  pipe(
    Effect.flatMap(Workflow.currentAttempt, (currentAttempt) =>
      currentAttempt === 0 ? Effect.fail(new TemporaryFailure({})) : Effect.unit),
    Workflow.step("process-payment", Schema.never, Schema.void)
  )

function processPaymentWorkflow(orderId: string) {
  return Effect.gen(function*(_) {
    const amount = yield* _(getAmountDue(orderId))
    yield* _()
  })
}
