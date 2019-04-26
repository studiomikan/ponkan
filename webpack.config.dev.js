const path = require('path')
const merge = require('webpack-merge')
const common = require("./webpack.config.common.js");

const devServerHost = process.env.WEBPACK_DEV_SERVER_HOST || 'localhost';
const devServerPort = process.env.WEBPACK_DEV_SERVER_PORT || 8080;

module.exports = merge(common, {
  mode: "development",
  output: {
    path: path.join(__dirname, 'dist_dev'),
  },
  devServer: {
    host: devServerHost,
    port: devServerPort,
    contentBase: path.join(__dirname, 'dist_dev')
  },
});

