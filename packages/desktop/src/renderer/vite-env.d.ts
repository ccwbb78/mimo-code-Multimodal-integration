/// <reference types="vite/client" />

interface Window {
  api: import("../preload/index").DesktopApi
  __OPENCODE__: {
    updaterEnabled: boolean
    deepLinks: string[]
    wsl: boolean
  }
}
