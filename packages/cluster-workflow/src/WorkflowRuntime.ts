/**
 * @since 1.0.0
 */
import * as Message from "@effect/cluster/Message"
import type { Schema } from "@effect/schema"
import { Exit, Fiber, Queue, Scope, Stream } from "effect"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as FiberId from "effect/FiberId"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as PrimaryKey from "effect/PrimaryKey"
import * as ReadonlyArray from "effect/ReadonlyArray"
import * as Ref from "effect/Ref"
import * as DurableExecutionEvent from "./DurableExecutionEvent.js"
import * as DurableExecutionJournal from "./DurableExecutionJournal.js"
import type * as Workflow from "./Workflow.js"
import * as WorkflowContext from "./WorkflowContext.js"
import * as WorkflowRuntimeMessage from "./WorkflowRuntimeMessage.js"
import * as WorkflowRuntimeState from "./WorkflowRuntimeState.js"

function handleReplayPhase<A, E>(
  wrs: WorkflowRuntimeState.WorkflowRuntimeState<A, E>,
  sa: DurableExecutionEvent.DurableExecutionEvent<A, E>,
  fiber: Fiber.Fiber<A, E>,
  mailbox: Queue.Dequeue<WorkflowRuntimeMessage.WorkflowRuntimeMessage<A, E>>
): Effect.Effect<WorkflowRuntimeState.WorkflowRuntimeState<A, E>, never, Scope.Scope> {
  return WorkflowRuntimeState.match(wrs, {
    onCompleted: (state) => {
      // on completed state we want to receive only completed event
      return pipe(
        Queue.take(mailbox),
        Effect.flatMap((ms) =>
          WorkflowRuntimeMessage.match(ms, {
            onRequestComplete: (message) => Deferred.succeed(message.signal, void 0),
            onRequestFork: () =>
              Effect.die(
                `Determinism has been broken! Can only receive RequestComplete in Completed state while replaying`
              ),
            onRequestJoin: () =>
              Effect.die(
                `Determinism has been broken! Can only receive RequestComplete in Completed state while replaying`
              ),
            onRequestYield: () =>
              Effect.die(
                `Determinism has been broken! Can only receive RequestComplete in Completed state while replaying`
              )
          })
        ),
        Effect.as(state)
      )
    },
    onRunning: () => {
      return Effect.die(`ABSURD: Cannot enter in running state while still replaying events.`)
    },
    onYielding: () => {
      return Effect.die(`ABSURD: Cannot enter in yielding state while still replaying events.`)
    },
    onReplay: (state) => {
      // we ensure that the sequence we get is the one we expected
      if (sa.sequence !== state.expectedSequence) {
        return Effect.die(
          `We expected to receive an event with the sequence ${state.expectedSequence} but got ${sa.sequence} instead. Seems like journal is broken or out of order.`
        )
      }
      // update the next expected sequence
      state = new WorkflowRuntimeState.Replay({ ...state, expectedSequence: sa.sequence + 1 })
      // switch based on the event type
      return (DurableExecutionEvent.match(sa, {
        // handle a recorded attempt of executing the workflow
        onAttempted: (_) => Effect.succeed(new WorkflowRuntimeState.Replay({ ...state, attempt: state.attempt + 1 })),
        // trigger interruption request of the workflow
        onInterruptionRequested: (_) =>
          pipe(
            Fiber.interrupt(fiber),
            Effect.forkScoped,
            Effect.as(new WorkflowRuntimeState.Replay({ ...state }))
          ),
        // journal is complete, enter in completed state
        onCompleted: (_) => {
          if (state.delayedMessages.length > 0) {
            return Effect.die(`Determinism has been broken! Journal is expected to be empty upon completion replay!`)
          }
          return Effect.succeed(new WorkflowRuntimeState.Completed({ exit: _.exit }))
        },
        // wait for forked to be treated
        onForked: (_) => {
          function processMessageWaitingForFork(sm: WorkflowRuntimeMessage.WorkflowRuntimeMessage<A, E>) {
            return WorkflowRuntimeMessage.match(sm, {
              onRequestJoin: () => Effect.succeed(false),
              onRequestYield: () => Effect.succeed(false),
              onRequestComplete: () => Effect.succeed(false),
              onRequestFork: (fork) => {
                if (_.persistenceId !== fork.persistenceId) {
                  return Effect.die(
                    `Determinism has been broken! Journal expected ${_.persistenceId} to be started, but got ${fork.persistenceId} instead!`
                  )
                }
                return pipe(
                  Deferred.succeed(fork.signal, void 0),
                  Effect.as(true)
                )
              }
            })
          }

          return pipe(
            Effect.findFirst(state.delayedMessages, processMessageWaitingForFork),
            Effect.flatMap(Option.match({
              onSome: (requestedFork) =>
                Effect.succeed(
                  new WorkflowRuntimeState.Replay({
                    ...state,
                    delayedMessages: ReadonlyArray.filter(state.delayedMessages, (_) => _ !== requestedFork)
                  })
                ),
              onNone: () =>
                Effect.gen(function*($) {
                  let delayedMessages = state.delayedMessages
                  while (true) {
                    const message = yield* $(Queue.take(mailbox))
                    if (yield* $(processMessageWaitingForFork(message))) {
                      return new WorkflowRuntimeState.Replay({ ...state, delayedMessages })
                    }
                    delayedMessages = delayedMessages.concat([message])
                  }
                })
            }))
          )
        },
        // wait for the join to be treated
        onJoined: (_) => {
          function processMessageWaitingForJoin(sm: WorkflowRuntimeMessage.WorkflowRuntimeMessage<A, E>) {
            return WorkflowRuntimeMessage.match(sm, {
              onRequestFork: () => Effect.succeed(false),
              onRequestYield: () => Effect.succeed(false),
              onRequestComplete: () => Effect.succeed(false),
              onRequestJoin: (requestedJoin) => {
                if (_.persistenceId !== requestedJoin.persistenceId) {
                  return Effect.succeed(false)
                }
                return pipe(
                  Deferred.succeed(requestedJoin.signal, void 0),
                  Effect.as(true)
                )
              }
            })
          }

          return pipe(
            Effect.findFirst(state.delayedMessages, processMessageWaitingForJoin),
            Effect.flatMap(Option.match({
              onSome: (message) =>
                Effect.succeed(
                  new WorkflowRuntimeState.Replay({
                    ...state,
                    delayedMessages: ReadonlyArray.filter(state.delayedMessages, (_) => _ !== message)
                  })
                ),
              onNone: () =>
                Effect.gen(function*($) {
                  let delayedMessages = state.delayedMessages
                  while (true) {
                    const message = yield* $(Queue.take(mailbox))
                    if (yield* $(processMessageWaitingForJoin(message))) {
                      return new WorkflowRuntimeState.Replay({ ...state, delayedMessages })
                    }
                    delayedMessages = delayedMessages.concat([message])
                  }
                })
            }))
          )
        }
      }))
    }
  })
}

function handleExecutionPhase<A, E>(
  persistenceId: string,
  success: Schema.Schema<A, unknown, never>,
  failure: Schema.Schema<E, unknown, never>,
  wrs: WorkflowRuntimeState.WorkflowRuntimeState<A, E>,
  ms: WorkflowRuntimeMessage.WorkflowRuntimeMessage<A, E>,
  fiber: Fiber.Fiber<A, E>,
  mailbox: Queue.Dequeue<WorkflowRuntimeMessage.WorkflowRuntimeMessage<A, E>>
): Effect.Effect<
  WorkflowRuntimeState.WorkflowRuntimeState<A, E>,
  never,
  Scope.Scope | DurableExecutionJournal.DurableExecutionJournal
> {
  console.log("state", wrs, "message", ms)
  return WorkflowRuntimeState.match(wrs, {
    // we need to switch from replay to running state and then run all the delayed messages one after the other
    onReplay: (state) => {
      return pipe(
        DurableExecutionJournal.append(
          persistenceId,
          success,
          failure,
          DurableExecutionEvent.Attempted(0)(state.expectedSequence)
        ),
        Effect.zipRight(
          Effect.reduce(
            state.delayedMessages.concat([ms]),
            new WorkflowRuntimeState.Running({
              attempt: state.attempt + 1,
              nextSequence: state.expectedSequence + 1
            }) as WorkflowRuntimeState.WorkflowRuntimeState<A, E>,
            (state, msg) => handleExecutionPhase(persistenceId, success, failure, state, msg, fiber, mailbox)
          )
        )
      )
    },
    // we are running so we need to handle the message
    onRunning: (state) => {
      return WorkflowRuntimeMessage.match(ms, {
        // on completion request we save the event, switch to completed state and then allow to exit
        onRequestComplete: (message) =>
          pipe(
            DurableExecutionJournal.append(
              persistenceId,
              success,
              failure,
              DurableExecutionEvent.Completed(message.exit)(state.nextSequence)
            ),
            Effect.as(new WorkflowRuntimeState.Completed({ exit: message.exit })),
            Effect.zipLeft(Deferred.succeed(message.signal, void 0))
          ),
        // on fork request we save the event, increment next sequence and allow fork to run
        onRequestFork: (message) =>
          pipe(
            DurableExecutionJournal.append(
              persistenceId,
              success,
              failure,
              DurableExecutionEvent.Forked(message.persistenceId)(state.nextSequence)
            ),
            Effect.as(new WorkflowRuntimeState.Running({ ...state, nextSequence: state.nextSequence + 1 })),
            Effect.zipLeft(Deferred.succeed(message.signal, void 0))
          ),
        // on join request we save the event, increment next sequence and allow join to run
        onRequestJoin: (message) =>
          pipe(
            DurableExecutionJournal.append(
              persistenceId,
              success,
              failure,
              DurableExecutionEvent.Joined(message.persistenceId)(state.nextSequence)
            ),
            Effect.as(new WorkflowRuntimeState.Running({ ...state, nextSequence: state.nextSequence + 1 })),
            Effect.zipLeft(Deferred.succeed(message.signal, void 0))
          ),
        // on yield request we trigger interrupt and immediately switch to yielding
        onRequestYield: () => pipe(Fiber.interrupt(fiber), Effect.as(new WorkflowRuntimeState.Yielding()))
      })
    },

    onYielding: (state) => {
      return WorkflowRuntimeMessage.match(ms, {
        // we yielded, so we cannot complete, interrupt!
        onRequestComplete: (message) =>
          pipe(
            Deferred.interrupt(message.signal),
            Effect.as(state)
          ),
        // we yielded! so we cannot start activities
        onRequestFork: (message) => pipe(Deferred.interrupt(message.signal), Effect.as(state)),
        // we yielded! so we cannot end activities
        onRequestJoin: (message) => pipe(Deferred.interrupt(message.signal), Effect.as(state)),
        // we wielded already for another reason!
        onRequestYield: () => Effect.succeed(state)
      })
    },
    onCompleted: (state) => {
      return WorkflowRuntimeMessage.match(ms, {
        // we completed already!
        onRequestComplete: (message) =>
          pipe(
            Deferred.succeed(message.signal, void 0),
            Effect.as(state)
          ),
        // we completed so no fork is allowed
        onRequestFork: (message) =>
          pipe(
            Deferred.die(message.signal, "ABSURD: Cannot receive new messages in completed state"),
            Effect.as(state)
          ),
        // we completed so no join is allowed
        onRequestJoin: (message) =>
          pipe(
            Deferred.die(message.signal, "ABSURD: Cannot receive new messages in completed state"),
            Effect.as(state)
          ),
        // we completed so yielding is a noop
        onRequestYield: () => Effect.succeed(state)
      })
    }
  })
}

/**
 * @since 1.0.0
 */
export function attempt<A extends Message.Message.Any, R>(workflow: Workflow.Workflow<A, R>) {
  return (
    request: A
  ): Effect.Effect<
    Message.Message.Success<A>,
    Message.Message.Error<A>,
    R | DurableExecutionJournal.DurableExecutionJournal
  > =>
    Effect.gen(function*($) {
      const persistenceId = PrimaryKey.value(request)
      const successSchema = Message.successSchema(request)
      const failureSchema = Message.failureSchema(request)
      const durableExecutionJournal = yield* $(DurableExecutionJournal.DurableExecutionJournal)

      const initialState = new WorkflowRuntimeState.Replay({
        expectedSequence: 0,
        attempt: 0,
        delayedMessages: []
      }) as WorkflowRuntimeState.WorkflowRuntimeState<Message.Message.Success<A>, Message.Message.Error<A>>
      const stateRef = yield* $(Ref.make(initialState))

      const mailbox = yield* $(
        Queue.unbounded<
          WorkflowRuntimeMessage.WorkflowRuntimeMessage<Message.Message.Success<A>, Message.Message.Error<A>>
        >()
      )

      const executionScope = yield* $(Scope.make())

      const isYielding = pipe(
        Ref.get(stateRef),
        Effect.map((_) =>
          WorkflowRuntimeState.match(_, {
            onYielding: () => true,
            onReplay: () => false,
            onCompleted: () => false,
            onRunning: () => false
          })
        )
      )

      const yieldExecution = pipe(
        Queue.offer(mailbox, new WorkflowRuntimeMessage.RequestYield()),
        Effect.zipRight(Effect.interrupt)
      )

      const forkAndJoin = <A2, E2, R2>(persistenceId: string, fa: Effect.Effect<A2, E2, R2>) =>
        pipe(
          Deferred.make<void>(),
          Effect.tap((signal) =>
            Queue.offer(mailbox, new WorkflowRuntimeMessage.RequestFork({ persistenceId, signal }))
          ),
          Effect.tap(Deferred.await),
          Effect.uninterruptible,
          Effect.zipRight(fa),
          Effect.zipLeft(
            pipe(
              Deferred.make<void>(),
              Effect.tap((signal) =>
                Queue.offer(mailbox, new WorkflowRuntimeMessage.RequestJoin({ persistenceId, signal }))
              ),
              Effect.tap(Deferred.await),
              Effect.uninterruptible
            )
          )
        )

      const makePersistenceId = (localId: string) => persistenceId + "__" + localId

      const fiber = yield* $(
        workflow.execute(request),
        Effect.onExit((exit) =>
          pipe(
            Deferred.make<void, never>(),
            Effect.tap((signal) => Queue.offer(mailbox, new WorkflowRuntimeMessage.RequestComplete({ exit, signal }))),
            Effect.flatMap((signal) => Deferred.await(signal)),
            Effect.zipLeft(Queue.shutdown(mailbox))
          )
        ),
        Effect.onInterrupt(() => {
          console.log("interrupting")
          return Queue.offer(mailbox, new WorkflowRuntimeMessage.RequestYield())
        }),
        Effect.provideService(WorkflowContext.WorkflowContext, {
          forkAndJoin,
          durableExecutionJournal,
          makePersistenceId,
          isYielding,
          yieldExecution
        }),
        Effect.forkIn(executionScope)
      )

      // start in replay state
      yield* $(
        durableExecutionJournal.read(persistenceId, successSchema, failureSchema, 0, false),
        Stream.runFoldEffect(initialState, (state, event) =>
          pipe(
            handleReplayPhase(state, event, fiber, mailbox),
            Effect.tap((state) => Ref.set(stateRef, state)),
            Effect.uninterruptible
          ))
      )

      // consume messages until the fiber exits
      return yield* $(
        Stream.fromQueue(mailbox),
        Stream.haltWhen(Fiber.await(fiber)),
        Stream.mapEffect((message) =>
          pipe(
            Ref.get(stateRef),
            Effect.flatMap((state) =>
              handleExecutionPhase(persistenceId, successSchema, failureSchema, state, message, fiber, mailbox)
            ),
            Effect.tap((state) => Ref.set(stateRef, state)),
            Effect.uninterruptible
          )
        ),
        Stream.runDrain,
        Effect.zipRight(Fiber.await(fiber)),
        Effect.flatten,
        Effect.onInterrupt(() => Scope.close(executionScope, Exit.interrupt(FiberId.none)))
      )
    }).pipe(Effect.scoped)
}
