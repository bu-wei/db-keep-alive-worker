#!/bin/bash

# =================================================================
# DB Keep-Alive Worker 一键部署脚本
# =================================================================
# 此脚本将自动完成以下操作:
# 1. 创建 Cloudflare Hyperdrive 配置
# 2. 更新 wrangler.toml 文件
# 3. 部署 Worker
# =================================================================

set -e

echo ""
echo "🚀 DB Keep-Alive Worker 一键部署脚本"
echo "====================================="
echo ""

# ---- Step 0: 检查依赖 ----
if ! command -v npx &> /dev/null; then
    echo "❌ 错误: 未找到 npx 命令。请先安装 Node.js。"
    exit 1
fi

# ---- Step 1: 收集数据库信息 ----
echo "📝 请输入您的数据库连接信息:"
echo ""
read -p "   ➡️ 数据库别名 (例如: my-supabase-db): " DB_NAME

if [ -z "$DB_NAME" ]; then
    echo "❌ 错误: 数据库别名不能为空。"
    exit 1
fi

read -p "   ➡️ 数据库主机 (Host): " DB_HOST
read -p "   ➡️ 端口 (Port, 默认 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "   ➡️ 数据库名称 (Database): " DB_DATABASE
read -p "   ➡️ 用户名 (User): " DB_USER
read -sp "   ➡️ 密码 (Password, 输入不可见): " DB_PASSWORD
echo ""

# 构建连接字符串
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

echo ""
echo "🔧 开始创建 Hyperdrive..."

# ---- Step 2: 创建 Hyperdrive ----
# 使用 wrangler hyperdrive create 命令
HYPERDRIVE_OUTPUT=$(npx wrangler hyperdrive create "$DB_NAME" --connection-string="$CONNECTION_STRING" 2>&1)

# 提取 Hyperdrive ID
HYPERDRIVE_ID=$(echo "$HYPERDRIVE_OUTPUT" | grep -oP 'id = "\K[^"]+')

if [ -z "$HYPERDRIVE_ID" ]; then
    echo "❌ 创建 Hyperdrive 失败。请检查您的数据库连接信息和 Cloudflare 账户设置。"
    echo "   详细信息: $HYPERDRIVE_OUTPUT"
    exit 1
fi

echo "✅ Hyperdrive 创建成功! ID: $HYPERDRIVE_ID"
echo ""

# ---- Step 3: 更新 wrangler.toml ----
echo "📄 正在更新 wrangler.toml..."

# 检查是否已有 [[hyperdrive]] 配置
if grep -q "^\[\[hyperdrive\]\]" wrangler.toml; then
    # 追加新的绑定
    echo "" >> wrangler.toml
    echo "[[hyperdrive]]" >> wrangler.toml
    echo "binding = \"$DB_NAME\"" >> wrangler.toml
    echo "id = \"$HYPERDRIVE_ID\"" >> wrangler.toml
else
    # 首次添加，替换注释
    {
        echo ""
        echo "[[hyperdrive]]"
        echo "binding = \"$DB_NAME\""
        echo "id = \"$HYPERDRIVE_ID\""
    } >> wrangler.toml
fi

echo "✅ wrangler.toml 已更新!"
echo ""

# ---- Step 4: 部署 Worker ----
read -p "🚀 是否现在部署 Worker? (y/n): " DEPLOY_NOW
if [ "$DEPLOY_NOW" == "y" ] || [ "$DEPLOY_NOW" == "Y" ]; then
    echo ""
    echo "📦 正在部署 Worker..."
    npx wrangler deploy
    echo ""
    echo "🎉 部署完成!"
else
    echo ""
    echo "⏸️ 已跳过部署。您可以稍后运行 'npx wrangler deploy' 来部署。"
fi

echo ""
echo "====================================="
echo "✨ 设置完成!"
echo "   如需添加更多数据库，请再次运行此脚本。"
echo "====================================="
