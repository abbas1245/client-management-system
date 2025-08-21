// Load configuration from environment or config file
const path = require('path');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Fix Ajv compatibility issues
      'ajv': path.resolve(__dirname, 'node_modules/ajv'),
      'ajv-keywords': path.resolve(__dirname, 'node_modules/ajv-keywords'),
    },
    configure: (webpackConfig) => {
      
      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });
        
        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
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
      }
      
      // Fix Ajv module resolution issues
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = webpackConfig.resolve.fallback || {};
      webpackConfig.resolve.fallback['ajv/dist/compile/codegen'] = false;
      
      // Handle React 19 compatibility
      if (webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias['react/jsx-runtime'] = require.resolve('react/jsx-runtime');
      }
      
      // Ensure proper module resolution
      webpackConfig.resolve.modules = webpackConfig.resolve.modules || [];
      webpackConfig.resolve.modules.push('node_modules');
      
      return webpackConfig;
    },
  },
};