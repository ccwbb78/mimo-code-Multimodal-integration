import { contextBridge, ipcRenderer } from "electron"

/**
 * Expose a minimal, secure API to the renderer process.
 *
 * All communication with the main process goes through this bridge.
 * The renderer cannot access Node.js APIs directly.
 */
const api = {
  // --- App info ---
  getVersion: () => ipcRenderer.invoke("app:getVersion") as Promise<string>,
  getName: () => ipcRenderer.invoke("app:getName") as Promise<string>,
  getOS: () => ipcRenderer.invoke("app:getOS") as Promise<"macos" | "windows" | "linux">,

  // --- Server ---
  getServerInfo: () =>
    ipcRenderer.invoke("server:getInfo") as Promise<{
      hostname: string
      port: number
      url: string
      username: string
      password: string
    } | null>,

  // --- Navigation ---
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url),

  // --- File dialogs ---
  openDirectoryPickerDialog: () => ipcRenderer.invoke("dialog:openDirectory") as Promise<string | null>,
  openFilePickerDialog: (filters?: Electron.FileFilter[]) =>
    ipcRenderer.invoke("dialog:openFile", { filters }) as Promise<string | null>,
  saveFilePickerDialog: (options?: { defaultPath?: string; filters?: Electron.FileFilter[] }) =>
    ipcRenderer.invoke("dialog:saveFile", options) as Promise<string | null>,

  // --- Clipboard ---
  readClipboardText: () => ipcRenderer.invoke("clipboard:readText") as Promise<string>,
  writeClipboardText: (text: string) => ipcRenderer.invoke("clipboard:writeText", text),
  readClipboardImage: () => ipcRenderer.invoke("clipboard:readImage") as Promise<string | null>,

  // --- Window ---
  setTitlebar: (theme: { mode: "light" | "dark" }) => ipcRenderer.invoke("window:setTitlebar", theme),

  // --- Updates ---
  checkUpdate: () => ipcRenderer.invoke("updater:check"),
  installUpdate: () => ipcRenderer.invoke("updater:install"),
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on("updater:available", (_event, info) => callback(info))
  },
  onUpdateProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on("updater:progress", (_event, progress) => callback(progress))
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on("updater:downloaded", (_event, info) => callback(info))
  },
  onUpdateError: (callback: (message: string) => void) => {
    ipcRenderer.on("updater:error", (_event, message) => callback(message))
  },

  // --- Debug ---
  exportDebugLogs: () => ipcRenderer.invoke("debug:exportLogs"),
  getLogPath: () => ipcRenderer.invoke("debug:getLogPath") as Promise<string | null>,

  // --- Desktop flags (used by the web app) ---
  updaterEnabled: true,
  deepLinks: ["opencode://"],
  wsl: false,
} as const

// Expose to renderer via window.api
contextBridge.exposeInMainWorld("api", api)

// __OPENCODE__ is defined in index.html as a writable object
// (contextBridge creates frozen objects which breaks deep-links.ts)

export type DesktopApi = typeof api
