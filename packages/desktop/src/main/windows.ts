import { BrowserWindow, shell, screen } from "electron"
import { join } from "path"
import type { ServerInfo } from "./server"

const log = {
  info: (...args: unknown[]) => console.log("[window]", ...args),
  warn: (...args: unknown[]) => console.warn("[window]", ...args),
  error: (...args: unknown[]) => console.error("[window]", ...args),
}

let mainWindow: BrowserWindow | null = null

/**
 * Create the main application window.
 */
export function createWindow(serverInfo: ServerInfo): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: Math.min(1440, width),
    height: Math.min(900, height),
    minWidth: 800,
    minHeight: 600,
    title: "MiMoCode",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#0a0a0a",
    show: false, // Show after ready-to-show
    webPreferences: {
      preload: join(__dirname, "..", "preload", "index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Need access to child_process for sidecar
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  })

  // Pass server info to the renderer via query params
  const rendererUrl = getRendererUrl()
  const url = new URL(rendererUrl)
  url.searchParams.set("server_url", serverInfo.url)
  url.searchParams.set("server_username", serverInfo.username)
  url.searchParams.set("server_password", serverInfo.password)

  // Show window when content is ready
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show()
    log.info("Main window shown")
  })

  // Load the renderer
  mainWindow.loadURL(url.toString())
  log.info(`Loading renderer from: ${url.toString()}`)

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url: href }) => {
    shell.openExternal(href)
    return { action: "deny" }
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Dev tools in development
  if (process.env.NODE_ENV === "development" || process.env.ELECTRON_DEV === "1") {
    mainWindow.webContents.openDevTools()
  }

  return mainWindow
}

/**
 * Get the main window instance.
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

/**
 * Get the renderer URL (dev server or built files).
 */
function getRendererUrl(): string {
  if (process.env.NODE_ENV === "development" || process.env.ELECTRON_DEV === "1") {
    // In dev, load from the Vite dev server
    return process.env.ELECTRON_RENDERER_URL || "http://localhost:3001"
  }

  // In production, load from built files
  return `file://${join(__dirname, "..", "renderer", "index.html")}`
}
