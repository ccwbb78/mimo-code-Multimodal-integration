# GitHub Actions 自动构建指南

## 概述

本项目已配置 GitHub Actions 自动构建工作流，可以自动为 macOS、Linux 和 Windows 构建安装包。

## 工作流文件

- 位置: `.github/workflows/build.yml`
- 功能: 自动构建三个平台的安装包

## 触发方式

### 1. 手动触发

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Build MiMo-Code for All Platforms**
4. 点击 **Run workflow**
5. 可选: 输入版本号
6. 点击 **Run workflow** 按钮

### 2. 自动触发 (推送标签)

```bash
# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

## 构建产物

工作流会为每个平台生成以下产物:

### macOS
- CLI: `mimocode-darwin-arm64/`, `mimocode-darwin-x64/`
- 桌面: `MiMoCode-*.dmg`, `MiMoCode-*.zip`

### Linux
- CLI: `mimocode-linux-arm64/`, `mimocode-linux-x64/`
- 桌面: `MiMoCode-*.AppImage`, `MiMoCode-*.deb`

### Windows
- CLI: `mimocode-windows-x64/`
- 桌面: `MiMoCode-*.exe`

## 查看构建状态

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 查看工作流运行状态
4. 点击具体的运行查看详细日志

## 下载构建产物

### 方法 1: 从 Actions 页面下载

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择一个已完成的工作流运行
4. 在 **Artifacts** 部分下载:
   - `macos-build`: macOS 版本
   - `linux-build`: Linux 版本
   - `windows-build`: Windows 版本
   - `all-platforms`: 所有平台打包

### 方法 2: 从 Releases 下载 (如果推送了标签)

1. 进入 GitHub 仓库页面
2. 点击 **Releases** 标签
3. 选择对应的版本
4. 下载对应平台的安装包

## 工作流配置详解

### 构建矩阵

```yaml
jobs:
  build-macos:     # macOS 构建
    runs-on: macos-latest

  build-linux:     # Linux 构建
    runs-on: ubuntu-latest

  build-windows:   # Windows 构建
    runs-on: windows-latest
```

### 构建步骤

每个平台的构建步骤:
1. 检出代码
2. 安装 Bun
3. 安装 Node.js
4. 安装依赖
5. 构建 CLI
6. 构建桌面应用
7. 上传产物

### 自定义版本号

手动触发时可以输入自定义版本号，留空则使用自动版本。

## 本地测试

在推送之前，可以本地测试构建:

```bash
# 安装依赖
bun install

# 测试 CLI 构建
cd packages/opencode
bun run script/build.ts --single

# 测试桌面构建
cd packages/desktop
bun run build
bun run package:win  # Windows
# bun run package:mac  # macOS
# bun run package:linux  # Linux
```

## 故障排除

### 构建失败

1. 查看 Actions 日志中的错误信息
2. 确保所有依赖都在 `package.json` 中声明
3. 检查是否有平台特定的依赖问题

### 产物未生成

1. 检查构建步骤是否成功完成
2. 查看上传步骤的日志
3. 确认输出路径正确

### 权限问题

确保仓库设置中启用了 Actions:
1. 进入仓库 Settings
2. 点击 Actions > General
3. 确保 "Allow all actions" 已选中

## 高级配置

### 添加代码签名

在工作流中添加签名步骤:

```yaml
- name: Sign macOS app
  if: runner.os == 'macOS'
  env:
    APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
    APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
  run: |
    # 签名代码
```

### 添加自动发布

在创建 Release 时自动上传到其他平台:

```yaml
- name: Upload to release
  uses: softprops/action-gh-release@v1
  with:
    files: |
      ./release/**/*.dmg
      ./release/**/*.zip
      ./release/**/*.AppImage
      ./release/**/*.deb
      ./release/**/*.exe
```

## 总结

使用 GitHub Actions 可以:
- ✅ 自动构建所有平台
- ✅ 无需本地环境
- ✅ 自动创建 Release
- ✅ 集中管理构建产物
- ✅ 支持手动和自动触发

这是最推荐的跨平台构建方式。
