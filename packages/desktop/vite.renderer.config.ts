import { resolve } from "path"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import solidPlugin from "vite-plugin-solid"

const appSrc = resolve(__dirname, "../app/src")

export default defineConfig({
  root: resolve(__dirname, "src/renderer"),
  plugins: [tailwindcss(), solidPlugin()],
  resolve: {
    alias: [
      // @ points to the app's src so the app's internal imports work
      { find: "@", replacement: appSrc },
    ],
  },
  // Let Vite resolve @mimo-ai/* packages through their exports field
  // (workspace packages are linked via node_modules)
  build: {
    outDir: resolve(__dirname, "dist/renderer"),
    target: "esnext",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/renderer/index.html"),
    },
  },
  server: {
    port: 3001,
  },
})
