/**
 * index.js
 * Main entry point for the Cloudflare Worker.
 */

import { initializeConfig } from './config.js';
import { executeAllChecks } from './db.js';
import { createHtmlResponse, createJsonResponse } from './ui.js';

function getLocalTimestamp() {
  return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
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

export default {
  /**
   * Handler for scheduled events (Cron triggers).
   */
  async scheduled(event, env, ctx) {
    console.log(`[定时任务] 触发于: ${getLocalTimestamp()}`);
    
    // 1. Initialize Config
    const config = initializeConfig(env);
    
    // 2. Execute Checks
    if (!config.error) {
        const checkReport = await executeAllChecks(config);
        logTaskResults(checkReport);
    } else {
        console.error(config.error);
    }
    
    console.log(`[定时任务] 执行完毕。`);
  },

  /**
   * Handler for HTTP requests (Web UI).
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Serve HTML Interface
    if (request.method === 'GET' && url.pathname === '/') {
      return createHtmlResponse();
    }

    // 2. Handle Manual Trigger API
    if (request.method === 'POST' && url.pathname === '/run-checks') {
      const config = initializeConfig(env);
      const report = await executeAllChecks(config);
      return createJsonResponse({
        timestamp: getLocalTimestamp(),
        summary: report.summary,
        results: report.outcomes,
      });
    }

    // 3. Handle Favicon
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });

    // 4. 404 For everything else
    return new Response("Not Found", { status: 404 });
  }
};
