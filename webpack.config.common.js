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
    // new UglifyJSPlugin(),
    new CopyWebpackPlugin(
      [ { from: '.', to: 'gamedata/', }, ],
      { context: path.join(__dirname, 'src/gamedata') }
    ),
    new CopyWebpackPlugin(
      [ { from: '.', to: 'fonts/', }, ],
      { context: path.join(__dirname, 'src/fonts') }
    ),
    new CopyWebpackPlugin(
      [ { from: '.', to: '', ignore: '!*.html' }, ],
      { context: path.join(__dirname, 'src') }
    ),
    new CopyWebpackPlugin(
      [ { from: '.', to: '', ignore: '!*.js' }, ],
      { context: path.join(__dirname, 'src') }
    ),
    new CopyWebpackPlugin(
      [ { from: '.', to: '', ignore: '!*.ico' }, ],
      { context: path.join(__dirname, 'src') }
    ),
    new WriteFilePlugin(),
  ]
}

