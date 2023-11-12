import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Layer from "effect/Layer"
import type * as ManagerConfig from "../ManagerConfig.js"

/** @internal */
const ManagerConfigSymbolKey = "@effect/cluster/ManagerConfig"

/** @internal */
export const ManagerConfigTypeId: ManagerConfig.ManagerConfigTypeId = Symbol.for(
  ManagerConfigSymbolKey
) as ManagerConfig.ManagerConfigTypeId

/** @internal */
export const managerConfigTag: Context.Tag<ManagerConfig.ManagerConfig, ManagerConfig.ManagerConfig> = Context.Tag<
  ManagerConfig.ManagerConfig
>()

/** @internal */
export const defaults: Layer.Layer<never, never, ManagerConfig.ManagerConfig> = Layer.succeed(managerConfigTag, {
  [ManagerConfigTypeId]: ManagerConfigTypeId,
  numberOfShards: 300,
  apiPort: 8080,
  rebalanceInterval: Duration.seconds(20),
  rebalanceRetryInterval: Duration.seconds(10),
  pingTimeout: Duration.seconds(3),
  persistRetryInterval: Duration.seconds(3),
  persistRetryCount: 100,
  rebalanceRate: 2 / 100
})
