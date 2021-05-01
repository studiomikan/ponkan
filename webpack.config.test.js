const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

const devServerHost = process.env.WEBPACK_DEV_SERVER_HOST || "0.0.0.0";
const devServerPort = process.env.WEBPACK_DEV_SERVER_PORT || 8080;

module.exports = {
  mode: "development",
  entry: {
    test: "./test/test.ts",
  },
  output: {
    path: path.join(__dirname, "dist_test"),
    filename: "[name].js",
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/, options: { configFile: "tsconfig.dev.json" } },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  devServer: {
    host: devServerHost,
    port: devServerPort,
    disableHostCheck: true,
    contentBase: __dirname,
  },
  plugins: [
    new webpack.ProvidePlugin({
      PIXI: "pixi.js",
    }),
    new CopyWebpackPlugin([
      { from: "src/fonts", to: "fonts" },
      { from: "src/index.html", to: "index.html" },
      { from: "src/favicon.ico", to: "favicon.ico" },
      { from: "src/style.css", to: "style.css" },
      { from: "test/testdata", to: "testdata" },
      { from: "test/test.html", to: "test.html" },
    ]),
    new WriteFilePlugin(),
  ],
  devtool: 'source-map',
};
