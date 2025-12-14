/**
 * ui.js
 * Space Guardian Theme - PostgreSQL Keep-Alive Worker UI
 * 
 * Design Philosophy:
 * - Space guardian/protector theme representing database "guardians"
 * - Deep space blue background with amber gold accents
 * - Star particle animations for atmosphere
 * - Pulse/breathing animations for "keep-alive" concept
 * - Glassmorphism card effects
 * 
 * Typography:
 * - JetBrains Mono: Code display, technical elements
 * - Plus Jakarta Sans: Body text, UI elements
 */

// ============================================================================
// CSS DESIGN SYSTEM
// ============================================================================
const HTML_STYLE = `
  /* Fonts Import */
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  /* CSS Variables - Design Tokens */
  :root {
    /* Colors - Space Theme */
    --color-void: #030712;
    --color-deep-space: #0f172a;
    --color-nebula: #1e293b;
    --color-stardust: #334155;
    --color-cosmic-text: #e2e8f0;
    --color-starlight: #f8fafc;
    
    /* Accent Colors */
    --color-amber: #f59e0b;
    --color-amber-glow: #fbbf24;
    --color-aurora-green: #10b981;
    --color-aurora-teal: #14b8a6;
    --color-plasma-red: #ef4444;
    --color-plasma-rose: #f43f5e;
    
    /* Gradients */
    --gradient-aurora: linear-gradient(135deg, var(--color-aurora-green) 0%, var(--color-aurora-teal) 100%);
    --gradient-amber: linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-glow) 100%);
    --gradient-danger: linear-gradient(135deg, var(--color-plasma-red) 0%, var(--color-plasma-rose) 100%);
    --gradient-space: radial-gradient(ellipse at top, var(--color-nebula) 0%, var(--color-deep-space) 50%, var(--color-void) 100%);
    
    /* Typography */
    --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    
    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;
    --space-3xl: 64px;
    
    /* Border Radius */
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-glow-amber: 0 0 30px rgba(245, 158, 11, 0.3);
    --shadow-glow-green: 0 0 30px rgba(16, 185, 129, 0.3);
    --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
    --shadow-elevated: 0 8px 40px rgba(0, 0, 0, 0.5);
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
  }
  
  /* Keyframe Animations */
  @keyframes starTwinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.2), 0 0 40px rgba(245, 158, 11, 0.1); }
    50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.2); }
  }
  
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes statusPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Reset & Base */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body {
    font-family: var(--font-display);
    background: var(--gradient-space);
    color: var(--color-cosmic-text);
    min-height: 100vh;
    line-height: 1.6;
    overflow-x: hidden;
    position: relative;
  }
  
  /* Star Field Background */
  .star-field {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  
  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    animation: starTwinkle 3s ease-in-out infinite;
  }
  
  /* Main Container */
  .guardian-container {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-xl);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }
  
  /* Header Section */
  .guardian-header {
    text-align: center;
    padding: var(--space-3xl) var(--space-xl);
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-card);
    animation: slideUp 0.6s ease-out;
  }
  
  .guardian-icon {
    font-size: 4rem;
    margin-bottom: var(--space-lg);
    animation: float 4s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.5));
  }
  
  .guardian-title {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--color-starlight) 0%, var(--color-amber-glow) 50%, var(--color-aurora-green) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
    margin-bottom: var(--space-sm);
  }
  
  .guardian-subtitle {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    font-weight: 400;
    color: var(--color-stardust);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: var(--space-2xl);
  }
  
  /* Trigger Button */
  .trigger-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-2xl);
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-void);
    background: var(--gradient-amber);
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all var(--transition-normal);
    animation: pulseGlow 2s ease-in-out infinite;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .trigger-btn:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--shadow-glow-amber), var(--shadow-elevated);
  }
  
  .trigger-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }
  
  .trigger-btn:disabled {
    background: var(--color-stardust);
    cursor: not-allowed;
    animation: none;
  }
  
  .trigger-btn .btn-icon {
    font-size: 1.3rem;
  }
  
  .trigger-btn.loading .btn-icon {
    animation: spin 1s linear infinite;
  }
  
  /* Status Indicator */
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    margin-top: var(--space-xl);
    padding: var(--space-md) var(--space-lg);
    background: rgba(15, 23, 42, 0.6);
    border-radius: var(--radius-full);
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }
  
  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-aurora-green);
    animation: statusPulse 2s ease-in-out infinite;
  }
  
  .status-dot.error {
    background: var(--color-plasma-red);
    animation: none;
  }
  
  .status-dot.loading {
    background: var(--color-amber);
    animation: breathe 1s ease-in-out infinite;
  }
  
  /* Results Section */
  .results-panel {
    display: none;
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    box-shadow: var(--shadow-card);
    animation: slideUp 0.5s ease-out;
  }
  
  .results-panel.visible {
    display: block;
  }
  
  .panel-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .panel-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-starlight);
  }
  
  .panel-icon {
    font-size: 1.5rem;
  }
  
  /* Result Cards */
  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-lg);
  }
  
  .result-card {
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    transition: all var(--transition-normal);
    animation: slideUp 0.4s ease-out backwards;
  }
  
  .result-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: var(--shadow-elevated);
  }
  
  .result-card.success {
    border-left: 3px solid var(--color-aurora-green);
  }
  
  .result-card.error {
    border-left: 3px solid var(--color-plasma-red);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }
  
  .card-status-icon {
    font-size: 1.2rem;
  }
  
  .card-name {
    font-family: var(--font-mono);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-starlight);
    word-break: break-all;
  }
  
  .card-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
  
  .metric-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: var(--radius-sm);
  }
  
  .metric-tag.latency {
    background: rgba(16, 185, 129, 0.15);
    color: var(--color-aurora-green);
  }
  
  .metric-tag.attempts {
    background: rgba(245, 158, 11, 0.15);
    color: var(--color-amber);
  }
  
  .metric-tag.error {
    background: rgba(239, 68, 68, 0.15);
    color: var(--color-plasma-red);
  }
  
  .metric-tag.success-badge {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(20, 184, 166, 0.3) 100%);
    color: #10b981;
    font-weight: 700;
    padding: var(--space-xs) var(--space-md);
    border: 1px solid rgba(16, 185, 129, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .metric-tag.error-badge {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(244, 63, 94, 0.3) 100%);
    color: #ef4444;
    font-weight: 700;
    padding: var(--space-xs) var(--space-md);
    border: 1px solid rgba(239, 68, 68, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  /* Usage Panel */
  .usage-panel {
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    animation: slideUp 0.7s ease-out;
  }
  
  .usage-content {
    font-size: 0.95rem;
    color: var(--color-cosmic-text);
  }
  
  .usage-content p {
    margin-bottom: var(--space-md);
  }
  
  .usage-content strong {
    color: var(--color-starlight);
    font-weight: 600;
  }
  
  .usage-content code {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    background: rgba(15, 23, 42, 0.8);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    color: var(--color-amber-glow);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .code-block {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    background: rgba(3, 7, 18, 0.8);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
    margin: var(--space-md) 0;
    line-height: 1.8;
  }
  
  .code-block .comment {
    color: var(--color-stardust);
  }
  
  .code-block .key {
    color: var(--color-aurora-teal);
  }
  
  .code-block .value {
    color: var(--color-amber-glow);
  }
  
  /* Footer */
  .guardian-footer {
    text-align: center;
    padding: var(--space-lg);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--color-stardust);
  }
  
  .guardian-footer a {
    color: var(--color-amber);
    text-decoration: none;
    transition: color var(--transition-fast);
  }
  
  .guardian-footer a:hover {
    color: var(--color-amber-glow);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .guardian-container {
      padding: var(--space-md);
    }
    
    .guardian-header {
      padding: var(--space-xl) var(--space-md);
    }
    
    .guardian-title {
      font-size: 1.8rem;
    }
    
    .guardian-icon {
      font-size: 3rem;
    }
    
    .trigger-btn {
      padding: var(--space-md) var(--space-xl);
      font-size: 1rem;
    }
    
    .result-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// ============================================================================
// CLIENT-SIDE JAVASCRIPT
// ============================================================================
const HTML_SCRIPT = `
  // Generate star field
  function createStarField() {
    const field = document.getElementById('starField');
    const starCount = 80;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      star.style.animationDuration = (2 + Math.random() * 2) + 's';
      star.style.width = (1 + Math.random() * 2) + 'px';
      star.style.height = star.style.width;
      field.appendChild(star);
    }
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', createStarField);
  
  // DOM Elements
  const triggerBtn = document.getElementById('triggerBtn');
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  const resultsPanel = document.getElementById('resultsPanel');
  const resultGrid = document.getElementById('resultGrid');
  
  // Create result card HTML
  function createResultCard(result, index) {
    const isSuccess = result.status === '成功';
    const statusIcon = isSuccess ? '✓' : '✕';
    const statusClass = isSuccess ? 'success' : 'error';
    const statusText = isSuccess ? '保活成功 Success' : '连接失败 Failed';
    
    let metricsHtml = '';
    
    // Add success/failure badge first
    if (isSuccess) {
      metricsHtml += \`<span class="metric-tag success-badge">✓ 保活成功</span>\`;
    } else {
      metricsHtml += \`<span class="metric-tag error-badge">✕ 连接失败</span>\`;
    }
    
    if (isSuccess && result.latency !== null) {
      metricsHtml += \`<span class="metric-tag latency">⚡ \${result.latency}ms</span>\`;
    }
    
    metricsHtml += \`<span class="metric-tag attempts">↻ \${result.attempts} 次尝试</span>\`;
    
    if (result.error) {
      const shortError = result.error.length > 30 ? result.error.substring(0, 30) + '...' : result.error;
      metricsHtml += \`<span class="metric-tag error" title="\${result.error}">⚠ \${shortError}</span>\`;
    }
    
    const card = document.createElement('div');
    card.className = \`result-card \${statusClass}\`;
    card.style.animationDelay = \`\${index * 0.1}s\`;
    card.innerHTML = \`
      <div class="card-header">
        <span class="card-status-icon">\${isSuccess ? '🟢' : '🔴'}</span>
        <span class="card-name">\${result.name}</span>
      </div>
      <div class="card-metrics">\${metricsHtml}</div>
    \`;
    
    return card;
  }
  
  // Handle trigger click
  triggerBtn.addEventListener('click', async () => {
    // Update UI to loading state
    triggerBtn.disabled = true;
    triggerBtn.classList.add('loading');
    triggerBtn.innerHTML = '<span class="btn-icon">⟳</span> 正在检测...';
    
    statusDot.className = 'status-dot loading';
    statusText.textContent = '正在唤醒数据库守护者...';
    
    resultsPanel.classList.remove('visible');
    resultGrid.innerHTML = '';
    
    try {
      const response = await fetch('/run-checks', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('API 响应错误: ' + response.status);
      }
      
      const data = await response.json();
      
      // Update status
      const successCount = data.results ? data.results.filter(r => r.status === '成功').length : 0;
      const totalCount = data.results ? data.results.length : 0;
      const allSuccess = successCount === totalCount && totalCount > 0;
      
      statusDot.className = allSuccess ? 'status-dot' : 'status-dot error';
      
      if (allSuccess) {
        statusText.textContent = \`🎉 全部保活成功 All Success! (\${successCount}/\${totalCount}) • \${data.timestamp}\`;
      } else if (totalCount > 0) {
        statusText.textContent = \`⚠️ 部分成功 (\${successCount}/\${totalCount}) • \${data.timestamp}\`;
      } else {
        statusText.textContent = \`✨ \${data.summary} • \${data.timestamp}\`;
      }
      
      // Render results
      if (data.results && data.results.length > 0) {
        data.results.forEach((result, index) => {
          resultGrid.appendChild(createResultCard(result, index));
        });
        resultsPanel.classList.add('visible');
      } else {
        statusDot.className = 'status-dot error';
        statusText.textContent = '⚠️ 未检测到 Hyperdrive 配置，请查看下方说明';
      }
      
    } catch (error) {
      statusDot.className = 'status-dot error';
      statusText.textContent = '❌ 检测失败: ' + error.message;
    } finally {
      triggerBtn.disabled = false;
      triggerBtn.classList.remove('loading');
      triggerBtn.innerHTML = '<span class="btn-icon">🚀</span> 启动守护检测';
    }
  });
`;

// ============================================================================
// HTML STRUCTURE
// ============================================================================
function getHtmlPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PostgreSQL Database Keep-Alive Worker - Prevent your free database from sleeping">
  <meta name="theme-color" content="#0f172a">
  <title>Database Guardian | PostgreSQL Keep-Alive</title>
  <style>${HTML_STYLE}</style>
</head>
<body>
  <!-- Star Field Background -->
  <div class="star-field" id="starField"></div>
  
  <!-- Main Container -->
  <div class="guardian-container">
    
    <!-- Header Section -->
    <header class="guardian-header">
      <div class="guardian-icon">🛡️</div>
      <h1 class="guardian-title">Database Guardian</h1>
      <p class="guardian-subtitle">PostgreSQL Keep-Alive Worker</p>
      
      <button id="triggerBtn" class="trigger-btn">
        <span class="btn-icon">🚀</span>
        启动守护检测
      </button>
      
      <div class="status-bar">
        <div class="status-dot" id="statusDot"></div>
        <span id="statusText">系统就绪 • 点击上方按钮开始检测</span>
      </div>
    </header>
    
    <!-- Results Panel -->
    <section class="results-panel" id="resultsPanel">
      <div class="panel-header">
        <span class="panel-icon">📊</span>
        <h2 class="panel-title">检测结果</h2>
      </div>
      <div class="result-grid" id="resultGrid"></div>
    </section>
    
    <!-- Usage Guide -->
    <section class="usage-panel">
      <div class="panel-header">
        <span class="panel-icon">💡</span>
        <h2 class="panel-title">配置指南</h2>
      </div>
      <div class="usage-content">
        <p><strong>推荐使用 Cloudflare Hyperdrive</strong></p>
        <p>本 Worker 专为搭配 Hyperdrive 设计，利用连接池复用技术获得最佳性能。</p>
        
        <p><strong>1. 创建 Hyperdrive</strong></p>
        <p>在 Cloudflare 控制台 → Workers & Pages → Hyperdrive → 创建新配置</p>
        
        <p><strong>2. 绑定到 Worker</strong></p>
        <p>修改 <code>wrangler.toml</code>，添加您的 Hyperdrive 绑定：</p>
        
        <div class="code-block">
<span class="comment"># Hyperdrive 绑定配置</span>
<span class="key">[[hyperdrive]]</span>
<span class="key">binding</span> = <span class="value">"MY_DATABASE"</span>
<span class="key">id</span> = <span class="value">"your-hyperdrive-config-id"</span>
        </div>
        
        <p><strong>3. 部署</strong></p>
        <p>运行 <code>npx wrangler deploy</code> 即可自动生效。Cron 触发器将每 5 分钟自动唤醒数据库。</p>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="guardian-footer">
      Powered by <a href="https://workers.cloudflare.com" target="_blank">Cloudflare Workers</a> & 
      <a href="https://developers.cloudflare.com/hyperdrive/" target="_blank">Hyperdrive</a>
    </footer>
  </div>
  
  <script>${HTML_SCRIPT}</script>
</body>
</html>`;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Creates a JSON response with proper headers.
 * @param {Object} data - Data to serialize as JSON
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 
      'Content-Type': 'application/json;charset=UTF-8',
      'Cache-Control': 'no-cache'
    },
  });
}

/**
 * Creates an HTML response with the main UI page.
 * @returns {Response}
 */
export function createHtmlResponse() {
  return new Response(getHtmlPage(), {
    headers: { 
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-cache'
    },
  });
}
