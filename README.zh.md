<h1 align="center">MiMoCode — 多模态集成</h1>

<p align="center">
  <img src="assets/readme/mimocode-banner.png" alt="MiMoCode" width="700">
</p>

<p align="center"><strong>一个集成了多模态视觉能力的 AI 编程助手</strong></p>

<p align="center">
  中文 | <a href="README.md">English</a>
</p>

---

## 关于本项目

这是 [MiMoCode](https://github.com/XiaomiMiMo/MiMo-Code) 的个人分支，核心增强功能是 **多模态桥接（Multimodal Bridge）** —— 让纯文本模型 `mimo-v2.5-pro` 通过调用具备视觉能力的 `mimo-v2.5` 来理解图片内容。

`mimo-v2.5-pro` 是一个强大的代码推理模型，但它是**纯文本模型** —— 无法直接处理图片。在实际开发中，我们经常需要分析 UI 截图、理解图片中的错误信息、审查架构图或解析截图中的代码片段。**多模态桥接**通过创建一个无缝的双模型流水线来解决这个问题。

---

## 多模态桥接

### 工作原理

```
 用户发送图片 + 文本
         │
         ▼
 mimo-v2.5（视觉模型）──→ 分析图片，生成文字描述
         │
         ▼
 mimo-v2.5-pro（推理模型）──→ 接收文字描述，对视觉内容进行推理
         │
         ▼
 智能响应 ──→ 代码分析、Bug 修复、架构指导
```

1. **图片检测** — 当用户发送带图片的提示时，系统检测消息中的图片附件
2. **视觉分析** — 图片发送给 `mimo-v2.5`（视觉模型），提示其详细描述内容，特别关注代码相关细节
3. **文本桥接** — 视觉模型的描述替换消息中的图片，以 `[多模态视觉分析]` 为前缀
4. **推理分析** — `mimo-v2.5-pro` 接收文字描述，用其完整的代码推理能力分析视觉内容

### 核心实现

桥接作为 AI SDK 中间件在消息管道中实现。当**同时满足以下三个条件**时自动激活：

1. Provider 为 `mimo` 或 `xiaomi`
2. 模型 ID 包含 `v2.5-pro`
3. 消息内容包含图片部分

核心实现位于 [`packages/opencode/src/provider/transform.ts`](packages/opencode/src/provider/transform.ts)：

```typescript
export async function multimodalBridge(
  msgs: ModelMessage[],
  visionModel: LanguageModelV3,
): Promise<ModelMessage[]> {
  // 提取用户消息中的所有图片部分
  // ...

  // 将所有图片一次性发送给视觉模型
  const { text } = await generateText({
    model: visionModel,
    messages: [{
      role: "user",
      content: [
        ...visionContent,
        { type: "text", text: "请详细描述以上所有图片的内容，保留对编程和代码相关的重要细节..." },
      ],
    }],
  })

  // 用视觉模型的文字描述替换图片部分
  // 每个图片部分变为：{ type: "text", text: "[多模态视觉分析] " + description }
}
```

### 启用多模态桥接

**方式一：TUI 交互开关（推荐）**

在 MiMoCode TUI 中按 `Ctrl+p` 打开命令面板，找到"多模态整合"点击切换。或使用斜杠命令：

```
/multimodal
```

**方式二：配置文件**

在 `.mimocode/mimocode.json` 中添加：

```json
{
  "experimental": {
    "multimodal_bridge": true
  }
}
```

**方式三：环境变量**

```bash
export MIMOCODE_MULTIMODAL_BRIDGE=true
```

> **注意：** 多模态桥接**默认关闭**。它仅在使用 `mimo-v2.5-pro` 作为主模型时激活 —— 其他模型（Claude、GPT 等）已原生支持图片输入。

---

## 快速开始

```bash
# 一键安装
curl -fsSL https://mimo.xiaomi.com/install | bash

# 或通过 npm 安装
npm install -g @mimo-ai/cli
```

首次启动自动引导配置。支持：

- **MiMo Auto（限时免费）** — 匿名通道，零配置
- **小米 MiMo 平台** — OAuth 登录
- **从 Claude Code 导入** — 一键迁移已有认证
- **自定义 Provider** — TUI 内添加任意 OpenAI 兼容 API

---

## 核心特性

### 多智能体

| 智能体 | 说明 |
|--------|------|
| **build** | 默认。完整工具权限，用于开发 |
| **plan** | 只读分析模式，适合代码探索和方案设计 |
| **compose** | 编排模式，适合 specs-driven 开发和 Skill 驱动流程 |

按 `Tab` 在主智能体间切换。子智能体由系统按需生成。

### 持久化记忆

基于 SQLite FTS5 全文搜索的跨会话记忆：

- **项目记忆** (`MEMORY.md`) — 跨会话持久的项目知识、规则、架构决策
- **会话检查点** (`checkpoint.md`) — 结构化状态快照，由 checkpoint-writer 子智能体自动维护
- **笔记暂存** (`notes.md`) — Agent 临时记录区
- **任务进展** (`tasks/<id>/progress.md`) — 逐任务日志

记忆自动在会话恢复时注入上下文，agent 无需重新理解项目背景。

### 智能上下文管理

- **自动检查点** — 根据模型上下文窗口自动决定什么时候保存会话状态
- **上下文重建** — 当上下文接近上限时，从最新 checkpoint、项目记忆、任务进展和保留的近期消息重建上下文，让 agent 继续当前任务
- **预算化注入** — 用 token budget 控制 checkpoint / memory / notes 注入上下文的大小，按重要性排序

### 任务追踪

树状任务系统（T1, T1.1, T1.2…），自动与检查点系统联动，恢复会话时任务进度不丢失。

### 子智能体系统

主智能体可按需生成子智能体，共享当前会话上下文并行工作，支持生命周期追踪、取消机制和后台执行。

### Goal / 停止条件

`/goal` 命令为会话设置停止条件。当 agent 想停下来时，由独立裁判模型评估对话内容，判断条件是否真正满足——防止自主工作中的"乐观停止"。

### Compose 编排模式

Compose 模式提供结构化的 specs-driven 开发流程，内置规划、执行、代码审查、TDD、调试、验证、合并等技能——编排从 spec 到交付的完整开发生命周期。

### 语音输入

基于 TenVAD 和 MiMo ASR 的实时流式语音输入。通过 `/voice` 激活，按停顿分片转写，文本逐段追加到输入框。仅对 MiMo 登录用户可用。

### Dream & Distill

- **`/dream`** — 扫描近期会话轨迹，提取持久知识到项目记忆，清理过时条目
- **`/distill`** — 发现近期工作中重复的手动工作流，将高置信度候选打包成可复用的 skill、subagent 或 command

---

## 配置

通过项目目录下的 `.mimocode/mimocode.json`（或全局 `~/.config/mimocode/mimocode.json`）配置。主要选项包括：

- Provider 和模型选择
- Agent 权限和自定义 Agent
- 检查点和记忆行为
- MCP 服务器连接
- 快捷键和主题
- **多模态桥接** (`experimental.multimodal_bridge`) — 为纯文本模型启用视觉能力

Max Mode（并行 best-of-N 推理 + 裁判选优）可通过配置中的 `experimental.maxMode` 开启。

---

## 开发

```bash
bun install              # 安装依赖
bun run dev              # 开发模式运行
bun turbo typecheck      # 类型检查
```

---

## 与 MiMoCode 的关系

本项目是 [MiMoCode](https://github.com/XiaomiMiMo/MiMo-Code) 的个人分支，MiMoCode 本身基于 [OpenCode](https://github.com/anomalyco/opencode) fork 构建。保留了 MiMoCode 的所有核心能力，并添加了**多模态桥接**功能。

---

## 许可证

源代码基于 [MIT 许可证](./LICENSE) 开源。

使用 MiMoCode 还需遵守[使用限制](./USE_RESTRICTIONS.md)。
使用小米 MiMo 托管服务须遵守 [MiMo 服务条款](https://platform.xiaomimimo.com/docs/terms/user-agreement)。
使用 MiMo 名称、标志和商标须遵守 MiMo 商标政策。

---

## 致谢

- [MiMoCode](https://github.com/XiaomiMiMo/MiMo-Code) — 基础项目
- [OpenCode](https://github.com/anomalyco/opencode) — 原始 fork 来源
- [小米 MiMo](https://mimo.xiaomi.com) — 提供强大的 mimo-v2.5-pro 和 mimo-v2.5 模型
