import * as DurableExecutionJournalPostgres from "@effect/cluster-pg/DurableExecutionJournalPostgres"
import * as Activity from "@effect/cluster-workflow/Activity"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import * as WorkflowEngine from "@effect/cluster-workflow/WorkflowEngine"
import { runMain } from "@effect/platform-node/NodeRuntime"
import * as Schema from "@effect/schema/Schema"
import * as Pg from "@sqlfx/pg"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"

const getTotalAmount = (orderId: string) =>
  Activity.make(
    "get-total-amount",
    Schema.number,
    Schema.never
  )(pipe(
    Effect.sync(() => Math.round(Math.random() * 10000) / 100),
    Effect.tap((amountDue) => Effect.logInfo("Amount due for order#" + orderId + " is " + amountDue + "..."))
  ))

const createShippingTrackingCode = (deliveryAddress: string) =>
  Activity.make("create-tracking-code", Schema.string, Schema.never)(pipe(
    pipe(
      Effect.logDebug("Creating tracking code to " + deliveryAddress + "..."),
      Effect.zipRight(Effect.sync(() => Math.round(Math.random() * 100000).toString(36)))
    )
  ))

const chargeCreditCard = (cardNumber: string, amountDue: number) =>
  Activity.make("charge-credit-card", Schema.void, Schema.never)(pipe(
    pipe(
      Effect.logDebug("Charging " + amountDue + "€ to card no." + cardNumber + "...")
    )
  ))

const sendOrderToShipping = (orderId: string, trackingId: string) =>
  Activity.make("send-order-to-shipping", Schema.void, Schema.never)(pipe(
    Effect.logDebug("Sending order " + orderId + " to shipping with trackingId " + trackingId + "...")
  ))

const sendConfirmationEmail = (email: string, orderId: string, trackingId: string) =>
  Activity.make("send-confirmation", Schema.void, Schema.never)(pipe(
    Effect.logDebug(
      "Sending confirmation email of " + orderId + " to " + email + " with trackingId " + trackingId + "..."
    )
  ))

class ProcessPaymentRequest extends Schema.TaggedRequest<ProcessPaymentRequest>()(
  "ProcessPaymentRequest",
  Schema.never,
  Schema.void,
  {
    orderId: Schema.string,
    cardNumber: Schema.string,
    email: Schema.string,
    deliveryAddress: Schema.string
  }
) {
}

const processPaymentWorkflow = Workflow.make(
  ProcessPaymentRequest,
  (_) => "ProcessPayment@" + _.orderId,
  ({ cardNumber, deliveryAddress, email, orderId }) =>
    Effect.gen(function*(_) {
      // get total order amount
      const totalAmount = yield* _(getTotalAmount(orderId))
      // charge the credit card
      yield* _(chargeCreditCard(cardNumber, totalAmount))
      // create a tracking id
      const trackingId = yield* _(createShippingTrackingCode(deliveryAddress))
      // send the order to shipment
      yield* _(sendOrderToShipping(orderId, trackingId))
      // send a confirmation email
      yield* _(sendConfirmationEmail(email, orderId, trackingId))
    })
)

const main = pipe(
  WorkflowEngine.makeScoped(processPaymentWorkflow),
  Effect.flatMap((engine) =>
    engine.send(
      new ProcessPaymentRequest({
        orderId: "order-1",
        cardNumber: "my-card",
        deliveryAddress: "My address, 5, Italy",
        email: "my@email.com"
      })
    )
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
