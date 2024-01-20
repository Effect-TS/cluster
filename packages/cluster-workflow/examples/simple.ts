import * as Activity from "@effect/cluster-workflow/Activity"
import * as DurableExecutionJournalMssql from "@effect/cluster-workflow/DurableExecutionJournalMssql"
import * as Workflow from "@effect/cluster-workflow/Workflow"
import { runMain } from "@effect/platform-node/Runtime"
import * as Schema from "@effect/schema/Schema"
import * as Mssql from "@sqlfx/mssql"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Secret from "effect/Secret"

class TemporaryFailure extends Schema.TaggedClass<TemporaryFailure>()("TemporaryFailure", {}) {
}

const getAmountDue = (orderId: string) =>
  pipe(
    Effect.sync(() => Math.round(Math.random() * 100) / 100),
    Activity.attempt("get-amount-due-" + orderId, Schema.never, Schema.number)
  )

const processPayment = (billingId: string, amountDue: number) =>
  pipe(
    Effect.flatMap(Activity.currentAttempt, (currentAttempt) =>
      currentAttempt === 0 ? Effect.die(new TemporaryFailure()) : pipe(
        Effect.logDebug("Processed payment of " + amountDue + " to " + billingId + "...")
      )),
    Activity.attempt("process-payment-" + billingId, Schema.never, Schema.void)
  )

function processPaymentWorkflow(orderId: string, billingId: string) {
  return Effect.gen(function*(_) {
    const amount = yield* _(getAmountDue(orderId))
    yield* _(processPayment(billingId, amount))
  }).pipe(Workflow.attempt("process", Schema.never, Schema.void))
}

const main = pipe(
  processPaymentWorkflow("order-1", "payment-1"),
  Effect.provide(DurableExecutionJournalMssql.activityJournalMssql),
  Effect.provide(Mssql.makeLayer({
    server: Config.succeed("localhost"),
    username: Config.succeed("sa"),
    password: Config.succeed(Secret.fromString("Zuffellat0")),
    database: Config.succeed("cluster")
  })),
  Logger.withMinimumLogLevel(LogLevel.All)
)

runMain(main)
