/// <reference types="vitest" />

import babel from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const babelConfig = require("./.babel.mjs.json")

export default defineConfig({
  plugins: [babel({ babel: babelConfig })],
  test: {
    include: ["packages/*/test/**/*.test.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "@effect/cluster/test": path.join(__dirname, "packages/cluster/test"),
      "@effect/cluster": path.join(__dirname, "packages/cluster/src"),

      "@effect/cluster-node/test": path.join(__dirname, "packages/cluster-node/test"),
      "@effect/cluster-node": path.join(__dirname, "packages/cluster-node/src")
    }
  }
})
