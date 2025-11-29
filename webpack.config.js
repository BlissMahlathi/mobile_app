const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
const envPath = path.resolve(__dirname, '.env');
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.warn('⚠️  Could not load .env file:', envConfig.error.message);
} else {
  console.log('✅ Loaded .env file with keys:', Object.keys(envConfig.parsed || {}).join(', '));
}

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@supabase/supabase-js']
      }
    },
    argv
  );

  // Add crypto polyfill for Node.js modules used by Supabase
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    vm: false, // Not needed in browser
    fs: false,
    path: false,
    os: false,
  };

  // Inject environment variables into the build
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(
        process.env.EXPO_PUBLIC_SUPABASE_URL || envConfig.parsed?.EXPO_PUBLIC_SUPABASE_URL
      ),
      'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || envConfig.parsed?.EXPO_PUBLIC_SUPABASE_ANON_KEY
      ),
    })
  );

  return config;
};
