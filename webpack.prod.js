const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = merge(common, {
    mode: 'production',
    devtool: "source-map",
    plugins: [
      new CleanWebpackPlugin(),
    ],
    optimization: {
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
              },
            },
          }),
        ],
      },
  });
