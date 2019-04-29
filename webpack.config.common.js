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
      { test: /\.ts$/, loader:'ts-loader', exclude: /node_modules/ }
    ]
  },
  resolve: {
    extensions:['.ts', '.js', '.json']
  },
  plugins: [
    // new UglifyJSPlugin(),
    new CopyWebpackPlugin(
      [ { from: '', to: 'gamedata/', }, ],
      { context: path.join(__dirname, 'src/gamedata') }
    ),
    new CopyWebpackPlugin(
      [ { from: '', to: 'fonts/', }, ],
      { context: path.join(__dirname, 'src/fonts') }
    ),
    new CopyWebpackPlugin(
      [ { from: '', to: '', }, ],
      { context: path.join(__dirname, 'src/index.html') }
    ),
    new WriteFilePlugin(),
  ]
}

