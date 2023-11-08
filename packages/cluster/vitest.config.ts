/// <reference types="vitest" />
import path from "path"
import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    include: ["./test/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@effect/cluster/test": path.join(__dirname, "test"),
      "@effect/cluster": path.join(__dirname, "src")
    }
  }
})
