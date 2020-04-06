const path = require("path");
const merge = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const common = require("./webpack.config.common.js");
const DtsBundleWebpack = require("dts-bundle-webpack");
const webpack = require('webpack');
const pjson = require('./package.json');

const banner = `
/*!
 * ${pjson.name} v${pjson.version}
 * (C) ${pjson.author.name}
 * license: ${pjson.license}
 */
`;

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.join(__dirname, "dist"),
  },
  module: {
    rules: [
      { enforce: "pre", test: /\.ts$/, loader: "eslint-loader", exclude: /node_modules/ },
      { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/, options: { configFile: "tsconfig.prod.json" } },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          max_line_len: 255,
        },
        extractComments: false,
      }),
    ],
    // runtimeChunk: true,
    // noEmitOnErrors: true,
    namedModules: false,
    namedChunks: false,
    moduleIds: 'size',
    chunkIds: 'size',
    // nodeEnv: '',
    mangleWasmImports: true,
    removeAvailableModules: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    flagIncludedChunks: true,
    occurrenceOrder: true,
    providedExports: true,
    usedExports: true,
    concatenateModules: true,
    // portableRecords: false,
  },
  plugins: [
    new DtsBundleWebpack({
      name: "ponkan",
      main: "src/ts/ponkan.d.ts",
      baseDir: "src/ts/",
      out: "../../dist/ponkan.d.ts",
      indent: "  ",
      removeSource: true,
      newline: "\n",
      exclude: /node_modules|test/,
    }),
    new webpack.BannerPlugin({
      banner: banner,
      raw: true
    })
  ],
});
