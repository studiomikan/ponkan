const path = require('path')

module.exports = {
  mode: "production",
  entry: {
    gen_command_ref_md: path.join(__dirname, 'manual/scripts/gen_command_ref_md.ts')
  },
  output: {
    path: path.join(__dirname, 'manual/scripts/tmp'),
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
}

