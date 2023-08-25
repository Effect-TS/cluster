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
      "@effect/sharding/test": path.join(__dirname, "packages/sharding/test"),
      "@effect/sharding": path.join(__dirname, "packages/sharding/src"),

      "@effect/sharding-node/test": path.join(__dirname, "packages/sharding-node/test"),
      "@effect/sharding-node": path.join(__dirname, "packages/sharding-node/src")
    }
  }
})
