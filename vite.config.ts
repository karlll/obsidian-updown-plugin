import { copyFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

const outDir = "dist";
const outputFile = "main.js";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["cjs"],
      fileName: () => outputFile,
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
    outDir,
    emptyOutDir: false,
    sourcemap: "inline",
    minify: false,
  },
  plugins: [
    {
      name: "copy-main-to-root",
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, outDir, outputFile),
            resolve(__dirname, outputFile),
          );
        } catch (err) {
          throw new Error(
            `Failed to copy ${outDir}/${outputFile} to project root: ${err instanceof Error ? err.message : err}`,
          );
        }
      },
    },
  ],
  test: {
    environment: "node",
  },
});
