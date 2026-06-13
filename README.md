<h1 align="center">MiMoCode — Multimodal Integration</h1>

<p align="center">
  <img src="assets/readme/mimocode-banner.png" alt="MiMoCode" width="700">
</p>

<p align="center"><strong>An AI coding assistant with integrated multimodal vision capabilities</strong></p>

<p align="center">
  <a href="README.zh.md">中文</a> | English
</p>

---

## About This Project

This is a personal fork of [MiMoCode](https://github.com/XiaomiMiMo/MiMo-Code) with a key enhancement: **Multimodal Bridge** — enabling the text-only `mimo-v2.5-pro` model to understand images by leveraging `mimo-v2.5`'s vision capabilities.

`mimo-v2.5-pro` is a powerful code reasoning model, but it's **text-only** — it cannot process images directly. In real-world development, we often need to analyze UI screenshots, understand error messages from images, review architecture diagrams, or parse code snippets from screenshots. The **Multimodal Bridge** solves this by creating a seamless two-model pipeline.

---

## Multimodal Bridge

### How It Works

```
 User sends image + text
         │
         ▼
 mimo-v2.5 (Vision Model)  ──→  Analyzes images, generates text description
         │
         ▼
 mimo-v2.5-pro (Reasoning Model)  ──→  Receives text description, reasons about visual content
         │
         ▼
 Intelligent Response  ──→  Code analysis, bug fixes, architecture guidance
```

1. **Image Detection** — When you send an image with your prompt, the system detects image attachments in the message
2. **Vision Analysis** — The image is sent to `mimo-v2.5` (vision-capable) with a prompt asking for detailed description, focusing on code-related details
3. **Text Bridge** — The vision model's description replaces the image in the message as `[多模态视觉分析]` prefixed text
4. **Reasoning** — `mimo-v2.5-pro` receives the text description and reasons about the visual content with its full coding intelligence

### Key Implementation

The bridge is implemented as AI SDK middleware in the message pipeline. It activates automatically when **all three conditions** are met:

1. Provider is `mimo` or `xiaomi`
2. Model ID contains `v2.5-pro`
3. Message content contains image parts

Core implementation in [`packages/opencode/src/provider/transform.ts`](packages/opencode/src/provider/transform.ts):

```typescript
export async function multimodalBridge(
  msgs: ModelMessage[],
  visionModel: LanguageModelV3,
): Promise<ModelMessage[]> {
  // Extract all image parts from user messages
  // ...

  // Send all images to the vision model in one call
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

  // Replace image parts with the vision model's text description
  // Each image part becomes: { type: "text", text: "[多模态视觉分析] " + description }
}
```

### Enable Multimodal Bridge

**Option 1: TUI Toggle (Recommended)**

In the MiMoCode TUI, press `Ctrl+p` to open the command palette, find "多模态整合" (Multimodal Integration) and click to toggle. Or use the slash command:

```
/multimodal
```

**Option 2: Config File**

Add to `.mimocode/mimocode.json`:

```json
{
  "experimental": {
    "multimodal_bridge": true
  }
}
```

**Option 3: Environment Variable**

```bash
export MIMOCODE_MULTIMODAL_BRIDGE=true
```

> **Note:** The multimodal bridge is **disabled by default**. It only activates when using `mimo-v2.5-pro` as the main model — other models (Claude, GPT, etc.) already support images natively.

---

## Quick Start

```bash
# One-line install
curl -fsSL https://mimo.xiaomi.com/install | bash

# Or install via npm
npm install -g @mimo-ai/cli
```

The first launch guides you through configuration automatically. Supported options:

- **MiMo Auto (free for a limited time)** — anonymous channel, zero configuration
- **Xiaomi MiMo Platform** — OAuth login
- **Import from Claude Code** — migrate existing authentication in one step
- **Custom Provider** — add any OpenAI-compatible API in the TUI

---

## Core Features

### Multiple Agents

| Agent | Description |
|--------|------|
| **build** | Default. Full tool permissions for development |
| **plan** | Read-only analysis mode for code exploration and solution design |
| **compose** | Orchestration mode for specs-driven development and skill-driven workflows |

Press `Tab` to switch between primary agents. Subagents are created by the system as needed.

### Persistent Memory

Cross-session memory powered by SQLite FTS5 full-text search:

- **Project memory** (`MEMORY.md`) — persistent project knowledge, rules, and architecture decisions
- **Session checkpoint** (`checkpoint.md`) — structured state snapshots maintained automatically by the checkpoint-writer subagent
- **Scratch notes** (`notes.md`) — temporary note area for agents
- **Task progress** (`tasks/<id>/progress.md`) — per-task logs

Memory is injected automatically when a session resumes, so the agent does not need to relearn project context.

### Intelligent Context Management

- **Automatic checkpoints** — decides when to save session state based on the model context window
- **Context reconstruction** — when context approaches the limit, rebuilds it from the latest checkpoint, project memory, task progress, and retained recent messages so the agent can continue the current task
- **Budgeted injection** — uses a token budget to control how much checkpoint, memory, and notes content enters context, with importance ranking

### Task Tracking

A tree-shaped task system (`T1`, `T1.1`, `T1.2`, …) that integrates automatically with the checkpoint system, so task progress is preserved when sessions resume.

### Subagent System

The primary agent can create subagents on demand. Subagents share the current session context and can work in parallel, with lifecycle tracking, cancellation, and background execution.

### Goal / Stop Condition

The `/goal` command sets a stopping condition for a session. When the agent tries to stop, an independent judge model evaluates the conversation to decide whether the condition is truly satisfied — preventing premature "optimistic stops" during autonomous work.

### Compose Mode

Compose mode provides a structured workflow for specs-driven development. It includes built-in skills for planning, execution, code review, TDD, debugging, verification, and merging — orchestrating the full lifecycle from spec to shipped code.

### Voice Input

Real-time streaming voice input powered by TenVAD and MiMo ASR. Activate with `/voice`, then speak — audio is segmented by pauses and transcribed incrementally into the input. Available for MiMo logged-in users.

### Dream & Distill

- **`/dream`** — scans recent session traces, extracts persistent knowledge into project memory, and removes outdated entries
- **`/distill`** — discovers repeated manual workflows in recent work and packages high-confidence candidates into reusable skills, subagents, or commands

---

## Configuration

MiMoCode is configured via `.mimocode/mimocode.json` in the project directory (or `~/.config/mimocode/mimocode.json` globally). Key options include:

- Provider and model selection
- Agent permissions and custom agents
- Checkpoint and memory behavior
- MCP server connections
- Keybindings and theme
- **Multimodal bridge** (`experimental.multimodal_bridge`) — enable vision for text-only models

Max Mode (parallel best-of-N reasoning with judge selection) can be enabled via `experimental.maxMode` in the config.

---

## Development

```bash
bun install              # Install dependencies
bun run dev              # Run in development mode
bun turbo typecheck      # Type check
```

---

## Relationship to MiMoCode

This project is a personal fork of [MiMoCode](https://github.com/XiaomiMiMo/MiMo-Code), which is itself built as a fork of [OpenCode](https://github.com/anomalyco/opencode). It keeps all core MiMoCode capabilities and adds the **Multimodal Bridge** feature.

---

## License

Source code is licensed under the [MIT License](./LICENSE).

Use of MiMoCode is also subject to the [Use Restrictions](./USE_RESTRICTIONS.md).
Use of Xiaomi MiMo-hosted services is subject to the [MiMo Terms of Service](https://platform.xiaomimimo.com/docs/terms/user-agreement).
Use of the MiMo name, logo, and trademarks is subject to the MiMo Trademark Policy.

---

## Acknowledgments

- [MiMoCode](https://github.com/XiaomiMiMo/MiMo-Code) — The base project
- [OpenCode](https://github.com/anomalyco/opencode) — The original fork origin
- [Xiaomi MiMo](https://mimo.xiaomi.com) — For the powerful mimo-v2.5-pro and mimo-v2.5 models
