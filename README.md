<h1 align="center">MiMoCode — Multimodal Bridge</h1>

<p align="center">
  <img src="assets/readme/mimocode-banner.png" alt="MiMoCode" width="700">
</p>

<p align="center"><strong>让 mimo-v2.5-pro 能"看图"的多模态桥接版本</strong></p>

<p align="center">
  <a href="README.zh.md">中文</a> | English
</p>

---

## 这是什么？

我是一个独立开发者，在用 MiMo Code 的 mimo-v2.5-pro 模型写代码时发现一个问题：**v2.5-pro 推理能力很强，但它不能看图片**。每次粘贴截图（报错信息、UI 设计稿、架构图）都会报 `ERROR: Cannot read "clipboard" (this model does not support image input)`。

所以我做了一个**多模态桥接**：把图片先发给 mimo-v2.5（视觉模型）分析，生成详细的文字描述，再把描述传给 v2.5-pro 推理。这样 v2.5-pro 就能间接"理解"图片内容了。

```
你发送图片 + 文字
       │
       ▼
mimo-v2.5（视觉模型）──→ 分析图片，生成文字描述
       │
       ▼
mimo-v2.5-pro（推理模型）──→ 结合文字描述进行深度推理
       │
       ▼
智能回复 ──→ 代码分析、Bug 修复、架构建议
```

## 怎么用？

### 1. 下载

从 [Releases](https://github.com/ccwbb78/mimo-code-Multimodal-integration/releases) 下载 `mimocode-windows-x64.zip`，解压后运行 `mimo.exe`。

### 2. 开启多模态桥接

在项目目录下创建 `.mimocode/mimocode.json`：

```json
{
  "experimental": {
    "multimodal_bridge": true
  }
}
```

或者在 TUI 里按 `Ctrl+P` 打开命令面板，找到「多模态整合」点击切换。

### 3. 使用

直接 `Ctrl+V` 粘贴图片，模型会自动分析。终端里会看到日志：

```
[multimodal bridge] sending 1 image(s) to vision model for analysis
[multimodal bridge: vision model resolved] visionModel: mimo-v2.5
```

### 自定义视觉模型

如果你的 provider 里视觉模型不叫 `mimo-v2.5`，可以手动指定：

```json
{
  "experimental": {
    "multimodal_bridge": true,
    "multimodal_bridge_vision_model": "your-vision-model-id"
  }
}
```

---

## 原版功能

以下是 MiMo Code 原有的功能，全部保留：

### 快速开始

```bash
# 一键安装
curl -fsSL https://mimo.xiaomi.com/install | bash

# 或通过 npm
npm install -g @mimo-ai/cli

# 运行
mimo
```

首次启动会自动引导配置：
- **MiMo Auto（限时免费）** — 匿名通道，零配置
- **小米 MiMo 平台** — OAuth 登录
- **从 Claude Code 导入** — 一步迁移已有认证
- **自定义 Provider** — 在 TUI 中添加任何 OpenAI 兼容 API

### 多 Agent 系统

| Agent | 说明 |
|--------|------|
| **build** | 默认，完整工具权限，用于开发 |
| **plan** | 只读分析模式，用于代码探索和方案设计 |
| **compose** | 编排模式，用于规范驱动开发和技能工作流 |

按 `Tab` 切换主 Agent。子 Agent 由系统按需创建。

### 持久化记忆

基于 SQLite FTS5 全文搜索的跨会话记忆：

- **项目记忆** (`MEMORY.md`) — 持久化的项目知识、规则和架构决策
- **会话检查点** (`checkpoint.md`) — 由检查点写入子 Agent 自动维护的结构化状态快照
- **临时笔记** (`notes.md`) — Agent 的临时记录区
- **任务进度** (`tasks/<id>/progress.md`) — 每个任务的日志

会话恢复时记忆自动注入，Agent 无需重新学习项目上下文。

### 智能上下文管理

- **自动检查点** — 根据模型上下文窗口决定何时保存会话状态
- **上下文重建** — 接近限制时从最新检查点、项目记忆、任务进度和保留的近期消息重建上下文
- **预算注入** — 使用 token 预算控制进入上下文的检查点、记忆和笔记内容量

### 任务追踪

树形任务系统（`T1`、`T1.1`、`T1.2`、…），自动与检查点系统集成，会话恢复时任务进度得以保留。

### 子 Agent 系统

主 Agent 可按需创建子 Agent。子 Agent 共享当前会话上下文，支持并行工作、生命周期跟踪、取消和后台执行。

### Goal / 停止条件

`/goal` 命令设置会话的停止条件。当 Agent 尝试停止时，独立的评判模型会评估对话以判断条件是否真正满足——防止自主工作中过早的"乐观停止"。

### Compose 模式

为规范驱动开发提供结构化工作流，包含规划、执行、代码审查、TDD、调试、验证和合并的内置技能。

### 语音输入

基于 TenVAD 和 MiMo ASR 的实时流式语音输入。`/voice` 激活后直接说话，音频按停顿分段并增量转写。

### Dream & Distill

- **`/dream`** — 扫描近期会话轨迹，提取持久知识到项目记忆
- **`/distill`** — 发现重复的手动工作流并打包为可复用的技能、子 Agent 或命令

---

## 配置

通过项目目录下的 `.mimocode/mimocode.json` 配置（或全局 `~/.config/mimocode/mimocode.json`）：

- Provider 和模型选择
- Agent 权限和自定义 Agent
- 检查点和记忆行为
- MCP 服务器连接
- 快捷键和主题

Max Mode（并行 best-of-N 推理 + 评判选择）可通过 `experimental.maxMode` 开启。

---

## 开发

```bash
bun install              # 安装依赖
bun run dev              # 开发模式运行
bun turbo typecheck      # 类型检查
```

---

## 与 OpenCode 的关系

MiMo Code 基于 [OpenCode](https://github.com/XiaomiMiMo/MiMo-Code) 的 fork 构建。保留了 OpenCode 的所有核心能力（多 Provider、TUI、LSP、MCP、插件），并添加了持久化记忆、智能上下文管理、子 Agent 编排、目标驱动自主循环、Compose 工作流以及 dream/distill 自我改进。

---

## 社区

扫码加入社区群聊：

<p align="center">
  <img src="assets/readme/community-qrcode.jpg" alt="Community group chat QR code" width="240">
</p>

---

## 许可证

源代码采用 [MIT 许可证](./LICENSE)。

使用 MiMo Code 还需遵守 [使用限制](./USE_RESTRICTIONS.md)。
使用小米 MiMo 托管服务需遵守 [MiMo 服务条款](https://platform.xiaomimimo.com/docs/terms/user-agreement)。
使用 MiMo 名称、标志和商标需遵守 MiMo 商标政策。
