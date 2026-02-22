import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        "obsidian",
        "electron",
        "child_process",
        "path",
        "fs",
        "os",
        "events",
        /^node:/,
      ],
    },
    outDir: ".",
    emptyOutDir: false,
    sourcemap: "inline",
    minify: false,
  },
  test: {
    environment: "node",
  },
});
