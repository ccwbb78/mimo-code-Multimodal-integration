@echo off
REM 推送到 GitHub 并触发构建
REM 使用方法: push-to-github.bat [版本号]

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ==========================================
echo 推送到 GitHub 并触发自动构建
echo ==========================================
echo.

REM 检查是否在 git 仓库中
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 当前目录不是 git 仓库
    echo 请先初始化 git: git init
    exit /b 1
)

REM 检查是否有未提交的更改
git status --porcelain | findstr /r /v "^$" >nul
if %errorlevel% equ 0 (
    echo [警告] 有未提交的更改
    echo.
    set /p commit_all="是否提交所有更改? (y/n): "
    if /i "!commit_all!"=="y" (
        set /p commit_msg="请输入提交信息: "
        git add -A
        git commit -m "!commit_msg!"
    )
)

REM 推送代码
echo.
echo [1/3] 推送代码到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [错误] 推送失败
    exit /b 1
)

REM 如果指定了版本号，创建标签
if not "%~1"=="" (
    echo.
    echo [2/3] 创建标签 %~1...
    git tag %~1
    git push origin %~1
    if %errorlevel% neq 0 (
        echo [错误] 标签推送失败
        exit /b 1
    )
    echo [完成] 标签 %~1 已推送，将触发自动构建
) else (
    echo.
    echo [2/3] 未指定版本号，跳过标签创建
    echo 如需触发构建，请使用: push-to-github.bat v1.0.0
)

echo.
echo [3/3] 完成!
echo.
echo ==========================================
echo 下一步操作:
echo ==========================================
echo.
echo 1. 访问 GitHub 仓库的 Actions 页面
echo 2. 查看构建状态
echo 3. 等待构建完成
echo 4. 下载构建产物
echo.
echo 或者手动触发构建:
echo 1. 进入 Actions 页面
echo 2. 选择 "Build MiMo-Code for All Platforms"
echo 3. 点击 "Run workflow"
echo.
echo ==========================================

endlocal
