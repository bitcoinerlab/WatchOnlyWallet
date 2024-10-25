const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const { resolver } = config;

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
  extraNodeModules: {
    net: require.resolve("react-native-tcp-socket"),
    tls: require.resolve("react-native-tcp-socket"),
  },
};

module.exports = withNativeWind(config, {
  inlineRem: 16,
  input: "./global.css",
});
