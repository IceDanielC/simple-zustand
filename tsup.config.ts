import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  minify: true,
  sourcemap: false,
  splitting: false,
  clean: true,
  dts: true,
});
