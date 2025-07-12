/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      "chromium-bidi",
      "fsevents",
      "@node-rs/argon2",
      "@node-rs/bcrypt",
    ],
  },
  test: {
    include:["./tests/*.test.tsx"],
    coverage: {
      provider: "istanbul",
    },
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
