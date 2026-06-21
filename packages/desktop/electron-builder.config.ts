import type { Configuration } from "electron-builder"

const config: Configuration = {
  appId: "com.mimo.desktop",
  productName: "MiMoCode",
  directories: {
    output: "C:/mimocode-build/desktop",
    buildResources: "build",
  },
  files: ["dist/**/*"],
  extraResources: [
    {
      from: "../opencode/dist/mimocode-${os}-${arch}/bin/",
      to: "bin/",
      filter: ["mimo*"],
    },
  ],
  mac: {
    target: ["dmg", "zip"],
    icon: "build/icon.icns",
    artifactName: "${name}-${version}-${arch}.${ext}",
  },
  win: {
    target: ["nsis", "portable"],
    icon: "build/icon.ico",
    artifactName: "${name}-${version}-${arch}.${ext}",
  },
  linux: {
    target: ["AppImage", "deb"],
    icon: "build/icon.png",
    artifactName: "${name}-${version}-${arch}.${ext}",
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
}

export default config
