import * as DurableExecutionJournalPostgres from "@effect/cluster-pg/DurableExecutionJournalPostgres"
import * as Activity from "@effect/cluster-workflow/Activity"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowEngine from "@effect/cluster-workflow/WorkflowEngine"
import { runMain } from "@effect/platform-node/Runtime"
import * as Schema from "@effect/schema/Schema"
import * as Pg from "@sqlfx/pg"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"

class PaymentGatewayTemporaryFailure {}
declare function isPaymentGatewayTemporaryFailure(value: unknown): value is PaymentGatewayTemporaryFailure
declare function getAmountDueFromShopifyApi(orderId: string): Effect.Effect<never, never, number>
declare function sendPaymentToGateway(
  cardNumber: string,
  amount: number
): Effect.Effect<never, never, void>
declare function sendEmailUsingSmtp(email: string, body: string): Effect.Effect<never, never, void>

class ProcessOrderPaymentRequest extends Schema.TaggedRequest<ProcessOrderPaymentRequest>()(
  "ProcessOrderPaymentRequest",
  Schema.never,
  Schema.void,
  {
    orderId: Schema.string,
    cardNumber: Schema.string,
    email: Schema.string
  }
) {
}

const processOrderPayment = Workflow.make(
  ProcessOrderPaymentRequest,
  (_) => _.orderId,
  ({ cardNumber, email, orderId }) =>
    Effect.gen(function*(_) {
      // gets the amount due to pay
      const amount = yield* _(getAmountDue(orderId))
      // send the request to the gateway
      yield* _(processPayment(cardNumber, amount))
      // send a thank you email
      yield* _(sendThankYouEmail(email))
    })
)

const getAmountDue = (orderId: string) =>
  Activity.make("get-amount-due", Schema.never, Schema.number)(pipe(
    Effect.logDebug(`Getting amount due for order #${orderId}...`),
    Effect.zipRight(getAmountDueFromShopifyApi(orderId))
  ))

const processPayment = (cardNumber: string, amountDue: number) =>
  Activity.make("process-payment", Schema.never, Schema.void)(pipe(
    pipe(
      Effect.logDebug(`Processed payment of ${amountDue} to ${cardNumber}...`),
      Effect.zipRight(sendPaymentToGateway(cardNumber, amountDue)),
      Effect.retryWhile((error) => isPaymentGatewayTemporaryFailure(error))
    )
  ))

const sendThankYouEmail = (email: string) =>
  Activity.make("send-thank-you", Schema.never, Schema.void)(pipe(
    Effect.logDebug(`Send thank you to ${email}...`),
    Effect.zipRight(sendEmailUsingSmtp(email, `Thanks for your purchase!`))
  ))

const main = pipe(
  WorkflowEngine.makeScoped(processOrderPayment),
  Effect.flatMap((engine) =>
    engine.start(new ProcessOrderPaymentRequest({ orderId: "order-1", cardNumber: "my-card", email: "my@email.com" }))
  ),
  Effect.provide(DurableExecutionJournalPostgres.DurableExecutionJournalPostgres),
  Effect.provide(Pg.makeLayer({
    host: Config.succeed("127.0.0.1"),
    username: Config.succeed("postgres"),
    database: Config.succeed("cluster")
  })),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.scoped
)

runMain(main)
