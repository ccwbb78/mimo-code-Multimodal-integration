# MiMoCode Desktop 桌面端

## 概述

MiMoCode Desktop 是基于 MiMo-Code CLI 版本构建的桌面应用程序，集成了所有 CLI 功能，并提供了现代化的图形用户界面。

## 已集成的功能

### 核心功能
- ✅ **多智能体系统** - build/plan/compose 智能体切换
- ✅ **持久化记忆** - SQLite FTS5 全文搜索的跨会话记忆
- ✅ **智能上下文管理** - 自动检查点、上下文重建、预算化注入
- ✅ **任务追踪** - 树状任务系统（T1, T1.1, T1.2…）
- ✅ **子智能体系统** - 主智能体可按需生成子智能体
- ✅ **Goal/停止条件** - `/goal` 命令设置停止条件
- ✅ **Compose 编排模式** - 结构化的 specs-driven 开发流程
- ✅ **Dream & Distill** - 自我进化功能

### 桌面端增强功能
- ✅ **崩溃报告器** - 自动收集崩溃日志
- ✅ **调试日志导出** - 一键导出调试日志
- ✅ **窗口恢复** - 窗口无响应时自动恢复
- ✅ **附件选择器** - 安全的文件附件管理
- ✅ **桌面菜单操作** - 完整的 macOS 菜单栏支持
- ✅ **捏合缩放** - 支持触控板捏合缩放
- ✅ **更新系统** - 自动检查和安装更新

### UI/UX 特性
- ✅ **中文汉化** - 完整的简体中文支持
- ✅ **主题系统** - 浅色/深色主题切换
- ✅ **快捷键** - 完整的键盘快捷键支持
- ✅ **侧边栏** - 项目和会话管理
- ✅ **终端集成** - 内置终端支持
- ✅ **文件树** - 文件浏览器
- ✅ **代码审查** - 会话级别的代码变更审查

## 技术架构

### 项目结构
```
packages/desktop/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── index.ts    # 主入口
│   │   ├── server.ts   # 服务器管理
│   │   ├── windows.ts  # 窗口管理
│   │   ├── ipc.ts      # IPC 通信
│   │   ├── menu.ts     # 菜单栏
│   │   └── ...
│   ├── preload/        # 预加载脚本
│   │   ├── index.ts    # API 暴露
│   │   └── types.ts    # 类型定义
│   └── renderer/       # 渲染进程
│       ├── index.tsx   # React 入口
│       ├── i18n/       # 国际化
│       └── ...
├── package.json        # 依赖配置
├── electron-builder.config.ts  # 构建配置
└── electron.vite.config.ts     # Vite 配置
```

### 依赖关系
- **Electron** - 桌面应用框架
- **SolidJS** - UI 框架
- **Vite** - 构建工具
- **electron-builder** - 应用打包
- **electron-log** - 日志系统
- **electron-store** - 持久化存储
- **electron-updater** - 自动更新

## 构建和运行

### 开发模式
```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

### 构建生产版本
```bash
# 构建所有平台
bun run build

# 构建特定平台
bun run package:mac    # macOS
bun run package:win    # Windows
bun run package:linux  # Linux
```

### 打包应用
```bash
# 打包所有平台
bun run package

# 打包特定平台
bun run package:mac
bun run package:win
bun run package:linux
```

## 配置说明

### 环境变量
- `OPENCODE_CHANNEL` - 构建通道（dev/beta/prod）
- `OPENCODE_PORT` - 服务器端口
- `OPENCODE_SERVER_USERNAME` - 服务器用户名
- `OPENCODE_SERVER_PASSWORD` - 服务器密码

### 配置文件
- `~/.config/mimocode/mimocode.json` - 全局配置
- `.mimocode/mimocode.json` - 项目配置

## 国际化

支持以下语言：
- English (en)
- 简体中文 (zh)
- 繁體中文 (zht)
- 한국어 (ko)
- Deutsch (de)
- Español (es)
- Français (fr)
- Dansk (da)
- 日本語 (ja)
- Polski (pl)
- Русский (ru)
- العربية (ar)
- Norsk (no)
- Português (br)
- Bosanski (bs)

## 更新日志

### v0.2.0 (当前版本)
- 从 OpenCode 迁移到 MiMoCode 品牌
- 集成 opencode-dev 桌面端基础设施
- 添加崩溃报告器和调试日志导出
- 改进窗口恢复和无响应处理
- 添加附件选择器和桌面菜单操作
- 支持捏合缩放
- 完善中文汉化
- 修复构建问题（外部化服务器模块）

## 许可证

基于 [MIT 许可证](./LICENSE) 开源。

## 相关链接

- [MiMoCode 官网](https://mimo.xiaomi.com/zh/mimocode)
- [GitHub 仓库](https://github.com/XiaomiMiMo/MiMo-Code)
- [文档](https://mimo.xiaomi.com/zh/mimocode/docs)
