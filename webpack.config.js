const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin');

const devServerHost = process.env.WEBPACK_DEV_SERVER_HOST || 'localhost';
const devServerPort = process.env.WEBPACK_DEV_SERVER_PORT || 8080;

module.exports = {
  entry: {
    ponkan3: './src/ponkan3.ts'
  },  
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/assets',
    filename: '[name].js'
  },
  devServer: {
    host: devServerHost,
    port: devServerPort,
    contentBase: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      { test: /\.ts$/, loader:'ts-loader', exclude: /node_modules/ },
      { test: /\.html$/, loader:'html-loader' },
    ]
  },
  resolve: {
    extensions:['.ts', '.js', '.json']
  },
  plugins: [
    // new UglifyJSPlugin(),
    new CopyWebpackPlugin(
      [ { from: '', to: 'gamedata/', }, ],
      { context: 'src/gamedata' }
    ),
    new CopyWebpackPlugin(
      [ { from: '', to: 'fonts/', }, ],
      { context: 'src/fonts' }
    ),
    new CopyWebpackPlugin(
      [ { from: '', to: '', }, ],
      { context: 'src/index.html' }
    ),
    new WriteFilePlugin(),
  ]
}

