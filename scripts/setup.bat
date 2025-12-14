@echo off
REM =================================================================
REM DB Keep-Alive Worker 一键部署脚本 (Windows)
REM =================================================================
REM 此脚本将自动完成以下操作:
REM 1. 创建 Cloudflare Hyperdrive 配置
REM 2. 更新 wrangler.toml 文件
REM 3. 部署 Worker
REM =================================================================

echo.
echo 🚀 DB Keep-Alive Worker 一键部署脚本
echo =====================================
echo.

REM ---- Step 0: 检查依赖 ----
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npx 命令。请先安装 Node.js。
    exit /b 1
)

REM ---- Step 1: 收集数据库信息 ----
echo 📝 请输入您的数据库连接信息:
echo.
set /p DB_NAME=   ➡️ 数据库别名 (例如: my-supabase-db): 

if "%DB_NAME%"=="" (
    echo ❌ 错误: 数据库别名不能为空。
    exit /b 1
)

set /p DB_HOST=   ➡️ 数据库主机 (Host): 
set /p DB_PORT=   ➡️ 端口 (Port, 默认 5432): 
if "%DB_PORT%"=="" set DB_PORT=5432
set /p DB_DATABASE=   ➡️ 数据库名称 (Database): 
set /p DB_USER=   ➡️ 用户名 (User): 

REM 密码输入 (Windows 不支持隐藏输入，需提示用户)
echo    (注意: 密码在命令行中不可见，但仍需注意安全)
set /p DB_PASSWORD=   ➡️ 密码 (Password): 

REM 构建连接字符串
set CONNECTION_STRING=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_DATABASE%

echo.
echo 🔧 开始创建 Hyperdrive...

REM ---- Step 2: 创建 Hyperdrive ----
REM 临时保存输出到文件以便解析
npx wrangler hyperdrive create %DB_NAME% --connection-string="%CONNECTION_STRING%" > hyperdrive_output.tmp 2>&1
type hyperdrive_output.tmp

REM 尝试从输出中解析 ID (简化版，可能需要用户手动复制)
echo.
echo 📋 请从上面的输出中复制 Hyperdrive ID (格式如: "id = \"xxxxxxxx\"")
set /p HYPERDRIVE_ID=   ➡️ 粘贴 ID: 

del hyperdrive_output.tmp

if "%HYPERDRIVE_ID%"=="" (
    echo ❌ 错误: Hyperdrive ID 不能为空。
    exit /b 1
)

echo ✅ Hyperdrive ID 已记录: %HYPERDRIVE_ID%
echo.

REM ---- Step 3: 更新 wrangler.toml ----
echo 📄 正在更新 wrangler.toml...

echo. >> wrangler.toml
echo [[hyperdrive]] >> wrangler.toml
echo binding = "%DB_NAME%" >> wrangler.toml
echo id = "%HYPERDRIVE_ID%" >> wrangler.toml

echo ✅ wrangler.toml 已更新!
echo.

REM ---- Step 4: 部署 Worker ----
set /p DEPLOY_NOW=🚀 是否现在部署 Worker? (y/n): 
if /i "%DEPLOY_NOW%"=="y" (
    echo.
    echo 📦 正在部署 Worker...
    npx wrangler deploy
    echo.
    echo 🎉 部署完成!
) else (
    echo.
    echo ⏸️ 已跳过部署。您可以稍后运行 'npx wrangler deploy' 来部署。
)

echo.
echo =====================================
echo ✨ 设置完成!
echo    如需添加更多数据库，请再次运行此脚本。
echo =====================================
pause
