const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow .gpx files to be bundled as static assets (loaded via expo-asset + fetch)
config.resolver.assetExts.push('gpx');

module.exports = config;
