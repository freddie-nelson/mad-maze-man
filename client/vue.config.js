const path = require("path");

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "@blz": path.resolve(__dirname, "node_modules/blaze-2d/lib/src"),
      },
    },
  },
};
