import { spawn, type ChildProcess } from "child_process"
import { join } from "path"
import { existsSync } from "fs"
import { app } from "electron"

// Use a simple logger to avoid electron-log CJS/ESM interop issues
const log = {
  info: (...args: unknown[]) => console.log("[main]", ...args),
  warn: (...args: unknown[]) => console.warn("[main]", ...args),
  error: (...args: unknown[]) => console.error("[main]", ...args),
}

export interface ServerInfo {
  hostname: string
  port: number
  url: string
  username: string
  password: string
}

interface CliLaunchConfig {
  command: string
  args: string[]
}

/**
 * Manages the MiMoCode CLI server as a child process.
 *
 * The CLI is started with `mimo serve --port 0 --hostname 127.0.0.1`
 * which picks a random available port. The server URL is parsed from
 * the CLI's stdout output.
 */
export class ServerManager {
  private process: ChildProcess | null = null
  private serverInfo: ServerInfo | null = null
  private readyPromise: Promise<ServerInfo> | null = null
  private readyResolve: ((info: ServerInfo) => void) | null = null
  private readyReject: ((error: Error) => void) | null = null

  /**
   * Start the CLI server and wait for it to be ready.
   */
  async start(): Promise<ServerInfo> {
    if (this.serverInfo) return this.serverInfo

    this.readyPromise = new Promise<ServerInfo>((resolve, reject) => {
      this.readyResolve = resolve
      this.readyReject = reject

      const launchConfig = this.resolveCliLaunchConfig()
      log.info(`Starting CLI server: ${launchConfig.command} ${launchConfig.args.join(" ")}`)

      // Generate a random password for this session
      const password = this.generatePassword()
      const username = "mimocode"

      this.process = spawn(launchConfig.command, launchConfig.args, {
        env: {
          ...process.env,
          MIMOCODE_SERVER_PASSWORD: password,
          MIMOCODE_SERVER_USERNAME: username,
          NODE_ENV: "production",
        },
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      })

      let stdout = ""
      let stderr = ""

      this.process.stdout?.on("data", (data: Buffer) => {
        const text = data.toString()
        stdout += text
        log.info(`[CLI stdout] ${text.trim()}`)

        // Parse the server URL from stdout
        // Expected format: "mimocode server listening on http://127.0.0.1:PORT"
        const match = stdout.match(
          /mimocode server listening on (https?:\/\/[\w.]+:(\d+))/
        )
        if (match && this.readyResolve) {
          const url = match[1]
          const port = parseInt(match[2], 10)
          const info: ServerInfo = {
            hostname: "127.0.0.1",
            port,
            url,
            username,
            password,
          }
          this.serverInfo = info
          this.readyResolve(info)
          this.readyResolve = null
          this.readyReject = null
        }
      })

      this.process.stderr?.on("data", (data: Buffer) => {
        const text = data.toString()
        stderr += text
        log.warn(`[CLI stderr] ${text.trim()}`)
      })

      this.process.on("error", (error) => {
        log.error("CLI process error:", error)
        if (this.readyReject) {
          this.readyReject(error)
          this.readyResolve = null
          this.readyReject = null
        }
      })

      this.process.on("exit", (code, signal) => {
        log.info(`CLI process exited with code ${code}, signal ${signal}`)
        this.process = null
        this.serverInfo = null

        if (this.readyReject) {
          this.readyReject(
            new Error(
              `CLI process exited before becoming ready (code: ${code}, stderr: ${stderr})`
            )
          )
          this.readyResolve = null
          this.readyReject = null
        }
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.readyReject) {
          this.readyReject(new Error("CLI server startup timed out after 30s"))
          this.readyResolve = null
          this.readyReject = null
          this.stop()
        }
      }, 30_000)
    })

    return this.readyPromise
  }

  /**
   * Stop the CLI server process.
   */
  stop(): void {
    if (this.process) {
      log.info("Stopping CLI server...")
      this.process.kill("SIGTERM")
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill("SIGKILL")
        }
      }, 5000)
      this.process = null
      this.serverInfo = null
    }
  }

  /**
   * Get the current server info (if running).
   */
  getServerInfo(): ServerInfo | null {
    return this.serverInfo
  }

  /**
   * Resolve how to launch the CLI binary.
   *
   * Priority:
   * 1. MIMOCODE_CLI_PATH env var (dev mode, set by dev script)
   * 2. Bundled binary (packaged app)
   * 3. Sibling package binary (monorepo dev, after build)
   * 4. Sibling package source via bun (monorepo dev, no build)
   * 5. Global PATH (fallback)
   */
  private resolveCliLaunchConfig(): CliLaunchConfig {
    const isWindows = process.platform === "win32"
    const binName = isWindows ? "mimo.cmd" : "mimo"
    const serveArgs = ["serve", "--port", "0", "--hostname", "127.0.0.1"]

    // 1. Environment variable override (dev mode)
    const envPath = process.env.MIMOCODE_CLI_PATH
    if (envPath) {
      const resolved = envPath.startsWith(".") ? join(__dirname, "..", "..", envPath) : envPath
      if (resolved.endsWith(".ts")) {
        // Use bun to run the CLI source directly
        // --conditions=browser is needed for proper module resolution
        return { command: "bun", args: ["run", "--conditions=browser", resolved, ...serveArgs] }
      }
      return { command: resolved, args: serveArgs }
    }

    // 2. Bundled binary (production)
    if (app.isPackaged) {
      const bundled = join(process.resourcesPath, "bin", binName)
      if (existsSync(bundled)) {
        return { command: bundled, args: serveArgs }
      }
    }

    // 3. Sibling package binary (development, after build)
    const siblingBin = join(
      __dirname,
      "..", // dist/main -> dist
      "..", // dist -> desktop
      "..", // desktop -> packages
      "..", // packages -> root
      "packages",
      "opencode",
      "bin",
      binName
    )
    if (existsSync(siblingBin)) {
      return { command: siblingBin, args: serveArgs }
    }

    // 4. Sibling package source via bun (development, no build needed)
    const siblingSrc = join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "packages",
      "opencode",
      "src",
      "index.ts"
    )
    if (existsSync(siblingSrc)) {
      return {
        command: "bun",
        args: ["run", "--conditions=browser", siblingSrc, ...serveArgs],
      }
    }

    // 5. Global PATH fallback
    log.warn("Could not find local CLI binary, falling back to PATH")
    return { command: binName, args: serveArgs }
  }

  private generatePassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
