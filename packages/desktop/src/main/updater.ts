import { ipcMain, type BrowserWindow } from "electron"

/**
 * Set up the auto-updater (stub).
 *
 * Note: Full auto-update support will be added when the desktop app
 * reaches production readiness.
 */
export function setupUpdater(_win: BrowserWindow): void {
  console.log("[updater] Auto-updater stub initialized")

  ipcMain.handle("updater:check", () => {
    console.log("[updater] Update check requested (not yet implemented)")
    _win.webContents.send("updater:not-available")
  })
  ipcMain.handle("updater:install", () => {
    console.log("[updater] Update install requested (not yet implemented)")
  })
}
