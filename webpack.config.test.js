const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  mode: "development",
  entry: {
    test: './test/ponkan3.test.ts'
  },
  output: {
    path: path.join(__dirname, 'dist_test'),
    publicPath: '/assets',
    filename: '[name].js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist_test')
  },
  module: {
    rules: [
      { test: /\.ts$/, loader:'ts-loader', exclude: /node_modules/ }
    ]
  },
  resolve: {
    extensions:['.ts', '.js', '.json']
  },
  plugins: [
    // new UglifyJSPlugin(),
    new CopyWebpackPlugin(
      [ { from: '', to: '', }, ],
      { context: 'test/test.html' }
    ),
    new WriteFilePlugin(),
  ]
}

