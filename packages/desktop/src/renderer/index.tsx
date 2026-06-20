import "@mimo-ai/app/index.css"
import { render } from "solid-js/web"
import {
  AppBaseProviders,
  AppInterface,
  PlatformProvider,
  ServerConnection,
  loadLocaleDict,
  normalizeLocale,
  type Platform,
  type Locale,
} from "@mimo-ai/app"
import type { DesktopApi } from "../preload/index"

// Declare the global APIs exposed by the preload script
declare global {
  interface Window {
    api: DesktopApi
    __OPENCODE__: {
      updaterEnabled: boolean
      deepLinks: string[]
      wsl: boolean
    }
  }
}

// --- Locale detection (same logic as web entry) ---
function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem("opencode.global.dat:language")
    if (stored) return normalizeLocale(stored)
  } catch (_) {}

  const languages = navigator.languages || [navigator.language]
  for (const lang of languages) {
    if (lang.startsWith("zh")) {
      return lang.includes("hant") || lang.includes("TW") || lang.includes("HK")
        ? normalizeLocale("zht")
        : normalizeLocale("zh")
    }
  }
  return normalizeLocale("en")
}

// --- Detect OS from user agent ---
function detectOS(): "macos" | "windows" | "linux" {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes("mac")) return "macos"
  if (ua.includes("win")) return "windows"
  return "linux"
}

// --- Parse server connection from URL params ---
function getServerConnection(): ServerConnection.Sidecar {
  const params = new URLSearchParams(window.location.search)
  const serverUrl = params.get("server_url") || "http://127.0.0.1:4096"
  const username = params.get("server_username") || "mimocode"
  const password = params.get("server_password") || ""

  return {
    type: "sidecar",
    variant: "base",
    http: {
      url: serverUrl,
      username,
      password,
    },
  }
}

// --- Desktop Platform implementation ---
const os = detectOS()

const platform: Platform = {
  platform: "desktop",
  os,

  // Navigation
  openLink: (url: string) => window.api.openExternal(url),
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  restart: () => window.location.reload(),

  // File dialogs
  openDirectoryPickerDialog: async () => {
    const result = await window.api.openDirectoryPickerDialog()
    return result ?? undefined
  },
  openFilePickerDialog: async (filters) => {
    const result = await window.api.openFilePickerDialog(filters)
    return result ?? undefined
  },
  saveFilePickerDialog: async (options) => {
    const result = await window.api.saveFilePickerDialog(options)
    return result ?? undefined
  },

  // Notifications
  notify: async (options) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(options.title, { body: options.body })
    } else if ("Notification" in window && Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        new Notification(options.title, { body: options.body })
      }
    }
  },

  // Updates
  checkUpdate: () => window.api.checkUpdate(),
  update: () => window.api.installUpdate(),

  // Clipboard
  readClipboardImage: () => window.api.readClipboardImage(),

  // Debug
  exportDebugLogs: () => window.api.exportDebugLogs(),
  recordFatalRendererError: (error: Error) => {
    console.error("Fatal renderer error:", error)
  },

  // Window titlebar (Electron-specific)
  webviewZoom: {
    get: () => Promise.resolve(1),
    set: () => Promise.resolve(),
  },
}

// --- Initialize and render ---
const locale = detectLocale()
const localeDict = await loadLocaleDict(locale)

const server = getServerConnection()
const defaultServer = ServerConnection.key(server)

const root = document.getElementById("root")!

render(
  () => (
    <PlatformProvider value={platform}>
      <AppBaseProviders>
        <AppInterface
          defaultServer={defaultServer}
          servers={[server]}
          disableHealthCheck={false}
        />
      </AppBaseProviders>
    </PlatformProvider>
  ),
  root,
)
