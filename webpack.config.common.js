const webpack = require('webpack');
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  entry: {
    ponkan3: path.join(__dirname, 'src/ts/ponkan3.ts')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    // publicPath: '/assets',
    filename: '[name].js'
  },
  module: {
    rules: [
      { enforce: "pre", test: /\.ts$/, loader: "eslint-loader", exclude: /node_modules/ },
      { test: /\.ts$/, loader:'ts-loader', exclude: /node_modules/ }
    ]
  },
  resolve: {
    extensions:['.ts', '.js', '.json']
  },
  plugins: [
    new webpack.ProvidePlugin({
      PIXI: 'pixi.js'
    }),
    new CopyWebpackPlugin(
      [
        { from: 'src/gamedata', to: 'gamedata' },
        { from: 'src/fonts', to: 'fonts' },
        { from: 'src/index.html', to: 'index.html' },
        { from: 'src/favicon.ico', to: 'favicon.ico' },
        { from: 'src/settings.js', to: 'settings.js' },
      ],
    ),
    new WriteFilePlugin(),
  ],
}

