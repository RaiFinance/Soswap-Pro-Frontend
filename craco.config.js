const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
        styleLoaderOptions: { injectType: 'lazyStyleTag' },
        modifyLessRule(lessRule, context) {
          lessRule.test = /\.theme\.(less|css)$/i;
          return lessRule;
        },
      },
    },
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      }
    },
  ],
};