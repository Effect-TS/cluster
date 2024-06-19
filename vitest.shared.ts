import * as path from "node:path"
import type { UserConfig } from "vitest/config"

const alias = (pkg: string) => ({
  [`@effect/${pkg}/test`]: path.join(__dirname, "packages", pkg, "test"),
  [`@effect/${pkg}`]: path.join(__dirname, "packages", pkg, "src")
})

// This is a workaround, see https://github.com/vitest-dev/vitest/issues/4744
const config: UserConfig = {
  esbuild: {
    target: "es2020"
  },
  test: {
    fakeTimers: {
      toFake: undefined
    },
    sequence: {
      concurrent: true
    },
    alias: {
      ...alias("cluster"),
      ...alias("cluster-browser"),
      ...alias("cluster-node"),
      ...alias("cluster-workflow")
    }
  }
}

export default config
