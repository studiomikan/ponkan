const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

module.exports = {
  entry: {
    ponkan: path.join(__dirname, "src/ts/ponkan.ts"),
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    library: "",
    libraryTarget: "umd",
    libraryExport: "",
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  plugins: [
    new webpack.ProvidePlugin({
      PIXI: "pixi.js",
    }),
    new CopyWebpackPlugin([
      { from: "src/gamedata", to: "gamedata" },
      { from: "src/fonts", to: "fonts" },
      { from: "src/index.html", to: "index.html" },
      { from: "src/favicon.ico", to: "favicon.ico" },
      { from: "src/settings.js", to: "settings.js" },
    ]),
    new WriteFilePlugin(),
  ],
  watchOptions: {
    aggregateTimeout: 500,
    poll: 1000
  }
};
