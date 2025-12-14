/**
 * db.js
 * Handles PostgreSQL database connections and keep-alive checks.
 */

import postgres from 'postgres';

/**
 * Sleeps for a specified number of milliseconds.
 * @param {number} ms 
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Performs a single keep-alive check (SELECT 1) on a database.
 * @param {Object} dbConfig - Database configuration object.
 * @param {Object} config - Global configuration object.
 * @returns {Promise<Object>} The result of the check.
 */
async function performCheck(dbConfig, config) {
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= config.retries) {
    attempts++;
    let sql = null;
    try {
      const connectionString = dbConfig.connectionString;
      
      // Intelligent SSL handling
      let sslOption = 'require'; 
      try {
          const url = new URL(connectionString);
          if (url.searchParams.get('sslmode') === 'disable') {
              sslOption = false;
          } else {
              // Default to lenient SSL for cloud databases (works best with Hyperdrive/Aiven)
              sslOption = { rejectUnauthorized: false }; 
          }
      } catch(e) {
        // Fallback if URL parsing fails
      }

      // Initialize postgres client with optimized settings for Cloudflare Workers
      sql = postgres(connectionString, {
        ssl: sslOption,
        max: 1, // Max connections (Hyperdrive handles pooling, so 1 is enough here)
        idle_timeout: 3, // idle connection timeout
        connect_timeout: 10, // 10s connection timeout
        prepare: false, // disable prepared statements for simple query
        transform: undefined, // no transformation needed
        connection: {
          application_name: config.appName,
        }
      });

      const start = Date.now();
      await sql`SELECT 1`; // The actual keep-alive query
      const duration = Date.now() - start;
      
      // Close the connection explicitly to free resources immediately
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

/**
 * Executes checks for all configured databases concurrently.
 * @param {Object} config - The global configuration object.
 * @returns {Promise<Object>} A report containing summary and individual outcomes.
 */
export async function executeAllChecks(config) {
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
