import { ipcMain, app, dialog, shell, clipboard } from "electron"
import { BrowserWindow } from "electron"
import type { ServerManager } from "./server"

/**
 * Set up IPC handlers for communication between main and renderer processes.
 */
export function setupIPC(serverManager: ServerManager): void {
  // --- App info ---
  ipcMain.handle("app:getVersion", () => app.getVersion())
  ipcMain.handle("app:getName", () => app.getName())
  ipcMain.handle("app:getOS", () => {
    switch (process.platform) {
      case "darwin":
        return "macos"
      case "win32":
        return "windows"
      default:
        return "linux"
    }
  })

  // --- Server info ---
  ipcMain.handle("server:getInfo", () => serverManager.getServerInfo())

  // --- Navigation ---
  ipcMain.handle("shell:openExternal", (_event, url: string) => {
    return shell.openExternal(url)
  })

  // --- File dialogs ---
  ipcMain.handle("dialog:openDirectory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle("dialog:openFile", async (_event, options?: { filters?: Electron.FileFilter[] }) => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: options?.filters,
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle("dialog:saveFile", async (_event, options?: { defaultPath?: string; filters?: Electron.FileFilter[] }) => {
    const result = await dialog.showSaveDialog({
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    })
    if (result.canceled) return null
    return result.filePath
  })

  // --- Clipboard ---
  ipcMain.handle("clipboard:readText", () => clipboard.readText())
  ipcMain.handle("clipboard:writeText", (_event, text: string) => {
    clipboard.writeText(text)
  })
  ipcMain.handle("clipboard:readImage", () => {
    const image = clipboard.readImage()
    if (image.isEmpty()) return null
    return image.toDataURL()
  })

  // --- Window ---
  ipcMain.handle("window:setTitle", (event, title: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.setTitle(title)
  })
  ipcMain.handle("window:setTitlebar", (_event, _theme: { mode: "light" | "dark" }) => {
    // Titlebar theme is handled by the OS; this is a no-op
  })

  // --- Debug ---
  ipcMain.handle("debug:exportLogs", async () => {
    // TODO: implement proper log file export
    dialog.showMessageBox({
      type: "info",
      title: "Export Logs",
      message: "Log export is not yet implemented.",
    })
  })

  ipcMain.handle("debug:getLogPath", () => {
    return null
  })

  console.log("[ipc] IPC handlers registered")
}
