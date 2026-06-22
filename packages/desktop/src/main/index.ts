import { app, BrowserWindow, shell, dialog } from "electron"
import { createWindow, getMainWindow } from "./windows"

const log = {
  info: (...args: unknown[]) => console.log("[main]", ...args),
  warn: (...args: unknown[]) => console.warn("[main]", ...args),
  error: (...args: unknown[]) => console.error("[main]", ...args),
}
import { setupIPC } from "./ipc"
import { setupMenu } from "./menu"
import { setupUpdater } from "./updater"
import { ServerManager } from "./server"

// Disable GPU acceleration on Linux to avoid rendering issues
if (process.platform === "linux") {
  app.disableHardwareAcceleration()
}

// Set app user model id for Windows
if (process.platform === "win32") {
  app.setAppUserModelId("com.mimo.desktop")
}

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
  process.exit(0)
}

// Configure logging
// Logging is via console (simple logger)

const serverManager = new ServerManager()

app.on("second-instance", () => {
  const win = getMainWindow()
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.whenReady().then(async () => {
  log.info("App starting...")

  // Set up IPC handlers (before window creation)
  setupIPC(serverManager)

  // Set up native menu
  setupMenu()

  // Start the CLI server
  try {
    const serverInfo = await serverManager.start()
    log.info(`CLI server ready at ${serverInfo.url}`)

    // Create the main window
    const win = createWindow(serverInfo)

    // Set up auto-updater (after window is ready)
    win.webContents.on("did-finish-load", () => {
      setupUpdater(win)
    })
  } catch (error) {
    log.error("Failed to start CLI server:", error)
    dialog.showErrorBox(
      "启动失败",
      `无法启动 MiMoCode CLI 服务。\n\n错误信息: ${error instanceof Error ? error.message : String(error)}\n\n请确保应用已正确安装，或尝试重新安装。`
    )
    app.quit()
  }
})

app.on("window-all-closed", () => {
  serverManager.stop()
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const serverInfo = serverManager.getServerInfo()
    if (serverInfo) {
      createWindow(serverInfo)
    }
  }
})

app.on("before-quit", () => {
  serverManager.stop()
})

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  log.error("Uncaught exception:", error)
})

process.on("unhandledRejection", (error) => {
  log.error("Unhandled rejection:", error)
})
