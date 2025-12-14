# PostgreSQL 数据库保活 Worker

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bu-wei/db-keep-alive-worker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

一个部署在 Cloudflare Workers 上的轻量级服务，定期连接 PostgreSQL 数据库（如 Supabase, Aiven, Neon 等），防止免费实例因空闲而休眠。

**中文** | [English](./README_EN.md)

---

## 📋 目录

- [功能特点](#-功能特点)
- [快速开始](#-快速开始)
  - [方式一：手动部署](#方式一手动部署-适合不熟悉命令行的用户)
  - [方式二：命令行部署](#方式二命令行自动部署-推荐---适合开发者)
- [使用说明](#️-使用说明)
- [项目结构](#-项目结构)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [许可证](#-license)

---

## ✨ 功能特点

| 特性 | 描述 |
|------|------|
| 🛡️ **永久在线** | 通过 Cron 触发器（默认每 5 分钟）定期"唤醒"您的数据库 |
| ⚡ **Hyperdrive 加速** | 利用 Cloudflare Hyperdrive 连接池复用技术，极大降低连接开销 |
| 🔄 **多数据库支持** | 添加多个 Hyperdrive 绑定，同时守护任意数量的数据库 |
| 📊 **可视化仪表盘** | 精美的太空主题 Web 界面，支持手动触发和实时延迟监控 |
| 💰 **零成本** | 完全运行在 Cloudflare Workers 免费额度内 |

---

## 🚀 快速开始

### 方式一：手动部署 (适合不熟悉命令行的用户)

无需本地运行任何命令，全程在 Cloudflare 网页控制台完成。

#### 步骤 1: 创建 Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Create Worker**
3. 给 Worker 起一个名字，例如 `db-keep-alive`，点击 **Deploy**
4. 点击 **Quick Edit**，粘贴 `src/worker.js` 中的代码

#### 步骤 2: 创建 Hyperdrive

1. 在 Cloudflare Dashboard 中，进入 **Workers & Pages** → **Hyperdrive**
2. 点击 **Create Hyperdrive**
3. 输入您的数据库连接信息（Host, Port, Database, User, Password）
4. 创建成功后，记下 **Config ID**

#### 步骤 3: 绑定 Hyperdrive 到 Worker

1. 回到您创建的 Worker 页面
2. 进入 **Settings** → **Bindings** → **Add Binding**
3. 选择 **Hyperdrive** 类型
4. 设置 **Variable name**（例如 `MY_DB`），选择您创建的 Hyperdrive 配置
5. 保存

#### 步骤 4: 设置 Cron 触发器

1. 在 Worker 的 **Settings** → **Triggers** 中
2. 在 **Cron Triggers** 下，点击 **Add Cron Trigger**
3. 输入 `*/5 * * * *` (每 5 分钟)
4. 保存

完成后，访问您的 Worker URL 即可看到仪表盘！

---

### 方式二：命令行自动部署 (推荐 - 适合开发者)

这种方式更快捷，脚本会自动处理一切。

#### 准备工作

1. 确保已安装 [Node.js](https://nodejs.org/)
2. Fork 本仓库到您的 GitHub 账户
3. Clone 到本地：

```bash
git clone https://github.com/bu-wei/db-keep-alive-worker.git
cd db-keep-alive-worker
```

4. 安装依赖：

```bash
npm install
```

5. 登录 Wrangler：

```bash
npx wrangler login
```

#### 一键部署

**Linux / macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows:**
```powershell
.\scripts\setup.bat
```

脚本会引导您输入数据库信息，然后自动完成：
1. 创建 Hyperdrive 配置
2. 更新 `wrangler.toml`
3. 部署 Worker

> 💡 **提示**：如需添加更多数据库，只需再次运行脚本即可。

---

## 🕹️ 使用说明

### 自动模式

Worker 会根据 Cron 策略（默认 `*/5 * * * *`）每 5 分钟自动运行一次。您无需进行任何操作。

### 手动模式

访问 Worker 的 URL，点击页面中央的 **"启动守护检测"** 按钮，查看所有数据库的连接状态和延迟。

---

## 📂 项目结构

```
db-keep-alive-worker/
├── src/
│   ├── index.js        # 主入口，调度器
│   ├── config.js       # 配置解析
│   ├── db.js           # 数据库连接逻辑
│   └── ui.js           # Web 界面 (太空守护者主题)
├── scripts/
│   ├── setup.sh        # Linux/macOS 一键部署脚本
│   └── setup.bat       # Windows 一键部署脚本
├── .github/
│   ├── workflows/      # GitHub Actions 自动部署
│   ├── ISSUE_TEMPLATE/ # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md
├── wrangler.toml       # Cloudflare Worker 配置
├── package.json
├── CONTRIBUTING.md     # 贡献指南
├── LICENSE
├── README.md           # 中文文档
└── README_EN.md        # English documentation
```

---

## ❓ 常见问题

<details>
<summary><strong>Q: 为什么需要这个服务？</strong></summary>

许多云数据库提供商（如 Supabase, Aiven, Neon）的免费计划会在一段时间不活动后使数据库进入休眠状态。此 Worker 通过定期发送简单的 `SELECT 1` 查询来保持数据库活跃。
</details>

<details>
<summary><strong>Q: 这会消耗我的数据库配额吗？</strong></summary>

几乎不会。`SELECT 1` 是最轻量的查询，每次只传输几个字节的数据。
</details>

<details>
<summary><strong>Q: Cloudflare Workers 免费额度够用吗？</strong></summary>

完全够用。免费计划每天有 100,000 次请求。每 5 分钟一次的 Cron 触发每天只需约 288 次请求。
</details>

<details>
<summary><strong>Q: 如何自动部署？</strong></summary>

项目已包含 GitHub Actions 工作流。设置 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 密钥后，推送到 main 分支即可自动部署。
</details>

---

## 🤝 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

---

## 📄 License

[MIT](./LICENSE)

---

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 无服务器基础设施
- [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive/) - 连接池加速
- [postgres.js](https://github.com/porsager/postgres) - PostgreSQL 客户端
