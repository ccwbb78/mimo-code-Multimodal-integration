# GitHub Actions 快速开始指南

## 第一步: 推送代码到 GitHub

### 方法 1: 使用批处理脚本 (推荐)

```batch
# 推送代码并触发构建
push-to-github.bat v1.0.0
```

### 方法 2: 手动推送

```bash
# 初始化 git (如果还没有)
git init

# 添加所有文件
git add -A

# 提交
git commit -m "Initial commit"

# 添加远程仓库 (替换为你的仓库地址)
git remote add origin https://github.com/你的用户名/MiMo-Code.git

# 推送
git push -u origin main

# 创建标签触发构建
git tag v1.0.0
git push origin v1.0.0
```

## 第二步: 查看构建状态

1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 你会看到 **Build MiMo-Code for All Platforms** 工作流正在运行

## 第三步: 等待构建完成

构建通常需要 10-20 分钟，取决于:
- 依赖下载速度
- 编译时间
- 平台数量

## 第四步: 下载构建产物

### 方法 1: 从 Actions 下载 (推荐)

1. 点击正在运行的工作流
2. 等待所有作业完成
3. 在 **Artifacts** 部分下载:
   - `macos-build` - macOS 版本
   - `linux-build` - Linux 版本
   - `windows-build` - Windows 版本
   - `all-platforms` - 所有平台打包

### 方法 2: 从 Releases 下载

1. 点击 **Releases** 标签
2. 选择对应的版本
3. 下载对应平台的安装包

## 构建产物说明

### macOS
- **CLI**: `mimocode-darwin-arm64/`, `mimocode-darwin-x64/`
- **桌面**: `MiMoCode-*.dmg`, `MiMoCode-*.zip`

### Linux
- **CLI**: `mimocode-linux-arm64/`, `mimocode-linux-x64/`
- **桌面**: `MiMoCode-*.AppImage`, `MiMoCode-*.deb`

### Windows
- **CLI**: `mimocode-windows-x64/`
- **桌面**: `MiMoCode-*.exe`

## 手动触发构建

如果不想要标签，可以手动触发:

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Build MiMo-Code for All Platforms**
4. 点击 **Run workflow**
5. 可选: 输入版本号
6. 点击 **Run workflow** 按钮

## 常见问题

### Q: 构建失败怎么办?

A: 查看 Actions 日志，通常是:
- 依赖问题
- 路径问题
- 权限问题

### Q: 如何取消构建?

A: 在 Actions 页面点击正在运行的工作流，然后点击 **Cancel workflow**

### Q: 构建产物保留多久?

A: 默认保留 30 天，可以在工作流中修改 `retention-days`

### Q: 如何修改构建配置?

A: 编辑 `.github/workflows/build.yml` 文件

## 高级用法

### 自定义触发条件

编辑 `.github/workflows/build.yml`:

```yaml
on:
  push:
    branches: [ main, develop ]  # 推送到这些分支时触发
    tags: [ 'v*' ]               # 推送标签时触发
  pull_request:
    branches: [ main ]           # PR 到 main 时触发
```

### 添加环境变量

在仓库 Settings > Secrets 中添加:
- `APPLE_CERTIFICATE`: macOS 证书
- `APPLE_CERTIFICATE_PASSWORD`: 证书密码

### 修改构建参数

编辑工作流文件中的构建命令:

```yaml
- name: Build CLI
  run: |
    cd packages/opencode
    bun run script/build.ts --single --baseline  # 添加 baseline 支持
```

## 总结

使用 GitHub Actions 的优势:
- ✅ 无需本地环境
- ✅ 自动构建所有平台
- ✅ 自动创建 Release
- ✅ 集中管理产物
- ✅ 支持手动和自动触发
- ✅ 免费 (公开仓库)

现在你可以轻松构建 macOS、Linux 和 Windows 版本了!
