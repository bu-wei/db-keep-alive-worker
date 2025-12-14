/**
 * config.js
 * Handles configuration parsing and Hyperdrive binding detection.
 */

const DEFAULT_CONFIG = {
  retryCount: 1,
  retryDelay: 3000,
  appName: "DB-KeepAlive-Worker/3.0 (Modular)",
};

/**
 * Parses the environment to find Hyperdrive bindings and other settings.
 * @param {Object} environment - The Worker environment object.
 * @returns {Object} The parsed configuration object.
 */
export function initializeConfig(environment) {
  const dbConfigs = [];
  let configError = null;

  // Dynamically detect all Hyperdrive bindings
  // Hyperdrive bindings are objects with a 'connectionString' property
  for (const [key, value] of Object.entries(environment)) {
    if (value && typeof value === 'object' && value.connectionString && typeof value.connectionString === 'string') {
       dbConfigs.push({
         name: `Hyperdrive (${key})`,
         connectionString: value.connectionString
       });
    }
  }

  // Parse retry settings
  const retries = parseInt(environment.RETRY_COUNT, 10);
  const maxRetries = isNaN(retries) ? DEFAULT_CONFIG.retryCount : retries;

  const delay = parseInt(environment.RETRY_DELAY, 10);
  const retryDelay = isNaN(delay) ? DEFAULT_CONFIG.retryDelay : delay;

  // Validate configuration
  if (dbConfigs.length === 0) {
      configError = "未找到 Hyperdrive 绑定。请在 wrangler.toml 中配置 [[hyperdrive]]。";
  }

  return {
    databases: dbConfigs,
    retries: maxRetries,
    delay: retryDelay,
    error: configError,
    appName: DEFAULT_CONFIG.appName,
  };
}
