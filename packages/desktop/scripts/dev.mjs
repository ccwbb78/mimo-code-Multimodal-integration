#!/usr/bin/env node
/**
 * Dev script that unsets ELECTRON_RUN_AS_NODE before starting electron-vite.
 * bun sets ELECTRON_RUN_AS_NODE=1 which prevents Electron from registering
 * its built-in module, so we must delete it before spawning.
 */
import { spawn } from "child_process"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const monorepoRoot = resolve(root, "../..")

// Clean environment — delete ELECTRON_RUN_AS_NODE so Electron works normally
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

// Set dev environment
env.MIMOCODE_CLI_PATH = "../opencode/src/index.ts"
env.ELECTRON_DEV = "1"

// Find electron-vite in root node_modules
const electronViteScript = resolve(monorepoRoot, "node_modules/electron-vite/bin/electron-vite.js")

// Run with node directly
const child = spawn("node", [electronViteScript, "dev"], {
  cwd: root,
  env,
  stdio: "inherit",
})

child.on("exit", (code) => {
  process.exit(code ?? 0)
})
