
import postgres from 'postgres';

const DEFAULT_CONFIG = {
  retryCount: 1,
  retryDelay: 3000,
  appName: "DB-KeepAlive-Worker/2.1 (Hyperdrive Support)",
};

function getLocalTimestamp() {
  return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function initializeConfig(environment) {
  let dbConfigs = [];
  let configError = null;

  // Legacy 'DATABASE_URLS' support removed in favor of Hyperdrive
  // If you still need direct connection strings, use Hyperdrive with a 'Local Connection String' for dev 

  // Dynamically detect all Hyperdrive bindings
  // Hyperdrive bindings are objects with a 'connectionString' property
  for (const [key, value] of Object.entries(environment)) {
    if (value && typeof value === 'object' && value.connectionString && typeof value.connectionString === 'string') {
       // Avoid duplicates if user named it confusingly similar to something else, though unlikely
       dbConfigs.push({
         name: `Hyperdrive (${key})`,
         connectionString: value.connectionString
       });
    }
  }

  // default retries reduced to 1 to avoid "Too many subrequests" error
  const retries = parseInt(environment.RETRY_COUNT, 10);
  const maxRetries = isNaN(retries) ? 1 : retries;

  const delay = parseInt(environment.RETRY_DELAY, 10);
  const retryDelay = isNaN(delay) ? DEFAULT_CONFIG.retryDelay : delay;

  if (dbConfigs.length === 0 && !configError) {
      configError = "未找到 Hyperdrive 绑定。请在 wrangler.toml 中配置 [[hyperdrive]]。";
  }

  return {
    databases: dbConfigs,
    retries: maxRetries,
    delay: retryDelay,
    error: configError,
  };
}

async function performCheck(dbConfig, config) {
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= config.retries) {
    attempts++;
    let sql = null;
    try {
      const connectionString = dbConfig.connectionString;
      
      // Check for SSL requirement in query params
      let sslOption = 'require'; 
      try {
          const url = new URL(connectionString);
          if (url.searchParams.get('sslmode') === 'disable') {
              sslOption = false;
          } else {
              // Default to lenient SSL for cloud databases
              sslOption = { rejectUnauthorized: false }; 
          }
      } catch(e) {}

      // Create a new client for each attempt using postgres.js
      // postgres.js handles connection pools and lifecycle differently, 
      // but for a worker we want a quick one-off connection usually.
      sql = postgres(connectionString, {
        ssl: sslOption,
        max: 1, // Max connections
        idle_timeout: 3, // idle connection timeout
        connect_timeout: 10, // 10s timeout
        prepare: false, // disable prepared statements for simple query
      });

      const start = Date.now();
      await sql`SELECT 1`;
      const duration = Date.now() - start;
      
      // Close the connection explicitly
      await sql.end();
      
      return { 
        name: dbConfig.name, 
        status: "成功", 
        latency: duration, 
        attempts, 
        error: null 
      };
      
    } catch (error) {
      lastError = error;
      if (sql) {
        try { await sql.end(); } catch (e) { /* ignore */ }
      }
    }

    if (attempts <= config.retries) {
      await sleep(config.delay);
    }
  }

  return {
    name: dbConfig.name,
    status: "失败",
    latency: null,
    attempts,
    error: lastError ? lastError.message : "未知错误",
  };
}

async function executeAllChecks(config) {
  if (config.error) {
    return { summary: config.error, outcomes: [] };
  }

  const allTasks = config.databases.map(db => performCheck(db, config));
  const settledOutcomes = await Promise.allSettled(allTasks);

  const finalOutcomes = settledOutcomes.map((outcome, index) => {
    if (outcome.status === "fulfilled") {
      return outcome.value;
    }
    return {
      name: config.databases[index].name,
      status: "系统错误",
      latency: null,
      attempts: 0,
      error: outcome.reason.message || "系统级错误",
    };
  });

  return {
    summary: `已检测 ${config.databases.length} 个数据库。`,
    outcomes: finalOutcomes,
  };
}

function logTaskResults(taskReport) {
  console.log(`[任务报告] ${taskReport.summary}`);
  if (taskReport.outcomes.length === 0) return;

  taskReport.outcomes.forEach(result => {
    const icon = result.status === '成功' ? '✅' : '❌';
    const details = result.error ? `错误: ${result.error}` : `延迟: ${result.latency}ms`;
    console.log(`${icon} ${result.name} | 状态: ${result.status} | 尝试: ${result.attempts}次 | ${details}`);
  });
}

function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  });
}

function createHtmlResponse(htmlContent) {
  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

// Reuse styles from original project but adapted
const HTML_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0; padding: 20px; min-height: 100vh;
    background: linear-gradient(-45deg, #e0f7fa, #e8f5e9, #f3e5f5, #e1f5fe);
    background-size: 400% 400%; animation: gradient 15s ease infinite;
    color: #263238; line-height: 1.6;
  }
  .main-container { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 25px; }
  .header { text-align: center; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 40px 50px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); width: 100%; }
  h1 { font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #006064 0%, #004d40 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 15px 0; }
  .subtitle { color: #546e7a; font-size: 16px; font-weight: 400; margin: 0 0 35px 0; opacity: 0.8; }
  .trigger-button { background: linear-gradient(135deg, #26a69a 0%, #00acc1 100%); color: white; border: none; padding: 18px 36px; border-radius: 50px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 25px rgba(38, 166, 154, 0.3); min-width: 220px; }
  .trigger-button:hover:not(:disabled) { transform: translateY(-3px) scale(1.05); box-shadow: 0 15px 35px rgba(38, 166, 154, 0.4); animation: bounce 1s infinite; }
  .trigger-button:disabled { background: linear-gradient(135deg, #b0bec5 0%, #cfd8dc 100%); cursor: not-allowed; }
  #status { font-size: 15px; font-weight: 500; min-height: 25px; text-align: center; padding: 10px 20px; border-radius: 12px; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.3); margin-top: 20px; }
  .results-section, .usage-panel { width: 100%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
  .results-section { display: none; }
  .results-section.show { display: block; animation: fadeIn 0.6s ease-out; }
  .section-title { font-size: 18px; font-weight: 600; color: #37474f; text-align: center; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #eceff1; }
  .result-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; animation: fadeIn 0.5s ease-out forwards; }
  .result-item:last-child { border-bottom: none; }
  .result-name { font-weight: 600; color: #455a64; flex-grow: 1; }
  .result-tags { display: flex; gap: 8px; flex-shrink: 0; margin-left: 15px; }
  .result-tag { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; white-space: nowrap; }
  .tag-success { background-color: #e8f5e9; color: #2e7d32; }
  .tag-error { background-color: #ffebee; color: #c62828; }
  .tag-info { background-color: #e1f5fe; color: #0277bd; }
  .usage-content { font-size: 14px; color: #546e7a; line-height: 1.8; }
  .usage-content code { background-color: #eceff1; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; color: #37474f; }
  @media (max-width: 768px) {
    body { padding: 15px; } .header { padding: 30px 20px; } h1 { font-size: 26px; }
    .result-item { flex-wrap: wrap; gap: 8px; }
  }
`;

const HTML_SCRIPT = `
  const triggerButton = document.getElementById('triggerButton');
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  const resultsSection = document.getElementById('resultsSection');

  function createResultItem(result) {
    const item = document.createElement('div');
    item.className = 'result-item';
    const isSuccess = result.status === '成功';
    const icon = isSuccess ? '✅' : '❌';
    
    // Name part
    const namePart = \`<div class="result-name">\${icon} \${result.name}</div>\`;
    
    // Tags part
    let tagsHtml = '';
    
    if (isSuccess) {
      tagsHtml += \`<span class="result-tag tag-success">连接成功</span>\`;
      if (result.latency !== null) tagsHtml += \`<span class="result-tag tag-info">\${result.latency}ms</span>\`;
    } else {
      tagsHtml += \`<span class="result-tag tag-error">连接失败</span>\`;
    }
    tagsHtml += \`<span class="result-tag tag-info">尝试: \${result.attempts}</span>\`;
    
    if (result.error) {
       tagsHtml += \`<span class="result-tag tag-error" title="\${result.error}">\${result.error.substring(0, 20)}\${result.error.length > 20 ? '...' : ''}</span>\`;
    }

    const tagsPart = \`<div class="result-tags">\${tagsHtml}</div>\`;
    item.innerHTML = namePart + tagsPart;
    return item;
  }

  triggerButton.addEventListener('click', async () => {
    triggerButton.disabled = true;
    triggerButton.textContent = '数据库连接检测中...';
    statusDiv.textContent = '正在连接数据库并执行 SELECT 1...';
    resultsDiv.innerHTML = '';
    resultsSection.classList.remove('show');

    try {
      const response = await fetch('/run-checks', { method: 'POST' });
      if (!response.ok) throw new Error('API 响应错误: ' + response.status);
      const data = await response.json();
      
      statusDiv.textContent = \`✨ 检测完成于 \${data.timestamp} | \${data.summary}\`;
      
      if (data.results && data.results.length > 0) {
        data.results.forEach(result => resultsDiv.appendChild(createResultItem(result)));
        resultsSection.classList.add('show');
      }
    } catch (error) {
      statusDiv.textContent = '❌ 执行失败: ' + error.message;
    } finally {
      triggerButton.disabled = false;
      triggerButton.textContent = '手动触发数据库保活';
    }
  });
`;

function getHtmlPage() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DB KeepAlive Worker</title>
  <style>${HTML_STYLE}</style>
</head>
<body>
  <div class="main-container">
    <div class="header">
      <h1>数据库保活助手 🛡️</h1>
      <p class="subtitle">定期连接 PostgreSQL 数据库以防止休眠</p>
      <button id="triggerButton" class="trigger-button">手动触发数据库保活</button>
      <div id="status">点击按钮测试数据库连接</div>
    </div>
    
    <div id="resultsSection" class="results-section">
      <h2 class="section-title">检测结果</h2>
      <div id="results"></div>
    </div>

    <div class="usage-panel">
      <h2 class="section-title">💡 配置说明</h2>
      <div class="usage-content">
        <p><strong>推荐使用 Cloudflare Hyperdrive</strong></p>
        <p>本 Worker 专为搭配 Hyperdrive 设计，以获得最佳性能和稳定性。</p>
        
        <p><strong>1. 创建 Hyperdrive</strong></p>
        <p>在 Cloudflare 控制台 -> Hyperdrive -> 创建新的配置。</p>
        
        <p><strong>2. 绑定到 Worker</strong></p>
        <p>修改 <code>wrangler.toml</code>，添加您的 Hyperdrive 绑定：</p>
        <pre><code>[[hyperdrive]]
binding = "MY_DB_1"
id = "您的配置ID"</code></pre>
        
        <p><strong>3. 部署</strong></p>
        <p>运行 <code>npx wrangler deploy</code> 即可自动生效。</p>
      </div>
    </div>
  </div>
  <script>${HTML_SCRIPT}</script>
</body>
</html>`;
}

export default {
  async scheduled(event, env, ctx) {
    console.log(`[定时任务] 触发于: ${getLocalTimestamp()}`);
    const config = initializeConfig(env);
    if (!config.error) {
        const checkReport = await executeAllChecks(config);
        logTaskResults(checkReport);
    } else {
        console.error(config.error);
    }
    console.log(`[定时任务] 执行完毕。`);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return createHtmlResponse(getHtmlPage());
    }

    if (request.method === 'POST' && url.pathname === '/run-checks') {
      const config = initializeConfig(env);
      const report = await executeAllChecks(config);
      return createJsonResponse({
        timestamp: getLocalTimestamp(),
        summary: report.summary,
        results: report.outcomes,
      });
    }

    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });

    return new Response("Not Found", { status: 404 });
  }
};
