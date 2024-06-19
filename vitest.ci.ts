import { defineWorkspace } from "vitest/config"

export default defineWorkspace([
  "packages/cluster",
  "packages/cluster-browser",
  "packages/cluster-node",
  "packages/cluster-workflow"
])
