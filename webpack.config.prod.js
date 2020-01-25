const path = require('path')
const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin');
const common = require("./webpack.config.common.js");
const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.join(__dirname, 'dist')
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        'max_line_len': 255,
      },
      extractComments: false
    })],
  },
  plugins: [
    new DtsBundleWebpack({
      name: 'ponkan3',
      main: 'dist/ponkan3.d.ts',
      baseDir: 'dist',
      out: 'ponkan3.d.ts',
      indent: '  ',
      removeSource: true,
      newline: '\n',
    })
  ],
});

