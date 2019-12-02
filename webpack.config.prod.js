const path = require('path')
const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const common = require("./webpack.config.common.js");
const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.join(__dirname, 'dist')
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            'max_line_len': 255
          }
        },
      }),
    ],
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

