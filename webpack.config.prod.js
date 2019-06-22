const path = require('path')
const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const common = require("./webpack.config.common.js");

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new UglifyJsPlugin(),
  ],
});

