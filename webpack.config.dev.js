const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.config.common.js");

const devServerHost = process.env.WEBPACK_DEV_SERVER_HOST || "0.0.0.0";
const devServerPort = process.env.WEBPACK_DEV_SERVER_PORT || 8080;

module.exports = merge(common, {
  mode: "development",
  output: {
    path: path.join(__dirname, "dist_dev"),
  },
  module: {
    rules: [
      { enforce: "pre", test: /\.ts$/, loader: "eslint-loader", exclude: /node_modules/ },
      { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/, options: { configFile: "tsconfig.dev.json" } },
    ],
  },
  devServer: {
    host: devServerHost,
    port: devServerPort,
    disableHostCheck: true,
    contentBase: path.join(__dirname, "dist_dev"),
  },
  devtool: 'source-map',
});
