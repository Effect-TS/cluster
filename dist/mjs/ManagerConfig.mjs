/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Duration from "@effect/data/Duration";
/**
 * @since 1.0.0
 * @category context
 */
export const ManagerConfig = /*#__PURE__*/Tag();
/**
 * @since 1.0.0
 * @category utils
 */
export const defaults = {
  numberOfShards: 300,
  apiPort: 8080,
  rebalanceInterval: /*#__PURE__*/Duration.seconds(20),
  rebalanceRetryInterval: /*#__PURE__*/Duration.seconds(10),
  pingTimeout: /*#__PURE__*/Duration.seconds(3),
  persistRetryInterval: /*#__PURE__*/Duration.seconds(3),
  persistRetryCount: 100,
  rebalanceRate: 2 / 100
};
//# sourceMappingURL=ManagerConfig.mjs.map