import { resolve } from "path"
import { defineConfig } from "electron-vite"
import tailwindcss from "@tailwindcss/vite"
import solidPlugin from "vite-plugin-solid"

const mainEntry = resolve(__dirname, "src/main/index.ts")
const preloadEntry = resolve(__dirname, "src/preload/index.ts")
const appSrc = resolve(__dirname, "../app/src")
const uiSrc = resolve(__dirname, "../ui/src")
const uiComponents = resolve(__dirname, "../ui/src/components")
const sharedSrc = resolve(__dirname, "../shared/src")

export default defineConfig({
  main: {
    build: {
      outDir: "dist/main",
      lib: {
        entry: mainEntry,
        formats: ["cjs"],
        fileName: () => "index.js",
      },
      rollupOptions: {
        input: mainEntry,
      },
      externalizeDeps: false,
    },
  },
  preload: {
    build: {
      outDir: "dist/preload",
      lib: {
        entry: preloadEntry,
        formats: ["cjs"],
        fileName: () => "index.js",
      },
      rollupOptions: {
        input: preloadEntry,
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "src/renderer"),
    plugins: [tailwindcss(), solidPlugin()],
    resolve: {
      alias: [
        // App internal @/ imports
        { find: "@", replacement: appSrc },
        // Workspace package: app
        { find: "@mimo-ai/app/index.css", replacement: resolve(appSrc, "index.css") },
        { find: "@mimo-ai/app", replacement: appSrc },
        // Workspace package: ui - subpath directories
        { find: "@mimo-ai/ui/context", replacement: resolve(uiSrc, "context") },
        { find: "@mimo-ai/ui/theme", replacement: resolve(uiSrc, "theme") },
        { find: "@mimo-ai/ui/styles/tailwind", replacement: resolve(uiSrc, "styles/tailwind/index.css") },
        { find: "@mimo-ai/ui/styles", replacement: resolve(uiSrc, "styles/index.css") },
        { find: "@mimo-ai/ui/i18n", replacement: resolve(uiSrc, "i18n") },
        { find: "@mimo-ai/ui/fonts", replacement: resolve(uiSrc, "assets/fonts") },
        { find: "@mimo-ai/ui/audio", replacement: resolve(uiSrc, "assets/audio") },
        { find: "@mimo-ai/ui/pierre", replacement: resolve(uiSrc, "pierre") },
        { find: "@mimo-ai/ui/hooks", replacement: resolve(uiSrc, "hooks") },
        // Components: @mimo-ai/ui/* -> ui/src/components/*.tsx
        { find: "@mimo-ai/ui", replacement: uiComponents },
        // Workspace package: shared
        { find: "@mimo-ai/shared", replacement: sharedSrc },
      ],
    },
    build: {
      outDir: resolve(__dirname, "dist/renderer"),
      target: "esnext",
      rollupOptions: {
        input: resolve(__dirname, "src/renderer/index.html"),
      },
    },
    worker: {
      format: "es",
    },
    server: {
      port: 3001,
    },
  },
})
