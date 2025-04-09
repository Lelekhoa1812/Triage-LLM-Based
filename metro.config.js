//module.exports = {
//  transformer: {
//    getTransformOptions: async () => ({
//      transform: {
//        experimentalImportSupport: false,
//        inlineRequires: false,
//      },
//    }),
//  },
//};

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const defaultConfig = getDefaultConfig(__dirname);
module.exports = mergeConfig(defaultConfig, {
  resolver: {
    blockList: [
      /.*\.log/,
      /.*\/\.git\/.*/,
      /.*\/node_modules\/react\/.*/,
    ],
  },
});
