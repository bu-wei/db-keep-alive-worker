# PostgreSQL Keep-Alive Worker

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/db-keep-alive-worker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

A lightweight Cloudflare Worker that periodically pings your PostgreSQL databases (Supabase, Aiven, Neon, etc.) to prevent free-tier instances from sleeping due to inactivity.

**[中文文档](./README.md)** | English

---

## ✨ Features

- **🛡️ Always On**: Cron-triggered pings (default: every 5 minutes) keep your databases awake
- **⚡ Hyperdrive Accelerated**: Leverages Cloudflare Hyperdrive's connection pooling for minimal overhead
- **🔄 Multi-Database Support**: Guard any number of databases with multiple Hyperdrive bindings
- **📊 Visual Dashboard**: Beautiful web interface for manual triggers and real-time latency monitoring
- **💰 Zero Cost**: Runs entirely within Cloudflare Workers' free tier

---

## 🚀 Quick Start

### Option 1: Manual Setup (No CLI Required)

Perfect for users who prefer the Cloudflare dashboard.

#### Step 1: Create a Worker

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Create Worker**
3. Name your Worker (e.g., `db-keep-alive`) and click **Deploy**
4. Click **Quick Edit** and paste the code from `src/worker.js`

#### Step 2: Create Hyperdrive

1. Go to **Workers & Pages** → **Hyperdrive** → **Create Hyperdrive**
2. Enter your database connection details (Host, Port, Database, User, Password)
3. Note down the **Config ID**

#### Step 3: Bind Hyperdrive to Worker

1. Return to your Worker settings
2. Go to **Settings** → **Bindings** → **Add Binding**
3. Select **Hyperdrive**, set a variable name (e.g., `MY_DB`), and choose your config
4. Save changes

#### Step 4: Set Up Cron Trigger

1. In Worker **Settings** → **Triggers**
2. Under **Cron Triggers**, click **Add Cron Trigger**
3. Enter `*/5 * * * *` (every 5 minutes)
4. Save

Visit your Worker URL to see the dashboard!

---

### Option 2: CLI Deployment (Recommended for Developers)

#### Prerequisites

- [Node.js](https://nodejs.org/) installed
- Fork this repository

#### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/db-keep-alive-worker.git
cd db-keep-alive-worker

# Install dependencies
npm install

# Login to Cloudflare (if not already)
npx wrangler login
```

#### One-Click Deploy

**Linux / macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows:**
```powershell
.\scripts\setup.bat
```

The script will guide you through:
1. Creating Hyperdrive configuration
2. Updating `wrangler.toml`
3. Deploying the Worker

Run the script again to add more databases.

---

## 🕹️ Usage

### Automatic Mode

The Worker runs automatically based on your Cron schedule (default: every 5 minutes). No action required.

### Manual Mode

Visit your Worker URL and click **"Activate Keep-Alive"** to manually trigger a check and view real-time results.

---

## 📂 Project Structure

```
db-keep-alive-worker/
├── src/
│   ├── index.js    # Main entry point & scheduler
│   ├── config.js   # Configuration parser
│   ├── db.js       # Database connection logic
│   └── ui.js       # Web interface (Space Guardian theme)
├── scripts/
│   ├── setup.sh    # Linux/macOS deployment script
│   └── setup.bat   # Windows deployment script
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── wrangler.toml   # Cloudflare Worker config
├── package.json
├── LICENSE
├── README.md       # Chinese documentation
└── README_EN.md    # English documentation (this file)
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

---

## 📄 License

[MIT](./LICENSE)

---

## 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) for serverless infrastructure
- [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive/) for connection pooling
- [postgres.js](https://github.com/porsager/postgres) for PostgreSQL client
