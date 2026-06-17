// craco.config.js
const path = require("path");
require("dotenv").config();

// Check if we're in development/preview mode (not production build)
// Craco sets NODE_ENV=development for start, NODE_ENV=production for build
const isDevServer = process.env.NODE_ENV !== "production";

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

let webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {

      // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
        ],
      };

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }
      return webpackConfig;
    },
  },
};

webpackConfig.devServer = (devServerConfig) => {
  // Long-lived caching for hashed CRA build artefacts. webpack-dev-server
  // serves /static/* with hashed filenames (e.g., main.<hash>.js), so it is
  // safe to ask browsers/CDNs to cache them aggressively. The HTML shell at
  // "/" is intentionally left short-cached by CRA defaults so deploys ship
  // immediately. Lighthouse "Use efficient cache lifetimes" target (June 2026
  // audit, ~222 KiB repeat-visit savings).
  devServerConfig.headers = {
    ...(devServerConfig.headers || {}),
  };
  const originalOnBeforeSetupMiddleware = devServerConfig.onBeforeSetupMiddleware;
  devServerConfig.setupMiddlewares = (middlewares, devServer) => {
    devServer.app.use((req, res, next) => {
      // Hashed static assets — long-cache + immutable.
      if (/\/static\/.+\.[A-Za-z0-9]+\.(?:js|css|woff2?|ttf|png|jpg|svg|webp)$/.test(req.url)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (/\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$/.test(req.url)) {
        // Public/static unhashed assets — 1 day; long enough for repeat
        // visits, short enough that favicon/logo swaps deploy fast.
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
      next();
    });
    if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
      setupHealthEndpoints(devServer, healthPluginInstance);
    }
    if (typeof originalOnBeforeSetupMiddleware === "function") {
      originalOnBeforeSetupMiddleware(devServer);
    }
    return middlewares;
  };

  return devServerConfig;
};

// Wrap with visual edits (automatically adds babel plugin, dev server, and overlay in dev mode)
if (isDevServer) {
  try {
    const { withVisualEdits } = require("@emergentbase/visual-edits/craco");
    webpackConfig = withVisualEdits(webpackConfig);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('@emergentbase/visual-edits/craco')) {
      console.warn(
        "[visual-edits] @emergentbase/visual-edits not installed — visual editing disabled."
      );
    } else {
      throw err;
    }
  }
}

module.exports = webpackConfig;
