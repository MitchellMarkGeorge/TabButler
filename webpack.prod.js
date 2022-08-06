const { merge } = require("webpack-merge");
const common = require("./webpack.config.js");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const path = require("path");

let isFirefox = process.env.BROWSER === "firefox";

const zipFileName = isFirefox ? "firefox.zip" : "chrome.zip";

module.exports = merge(common, {
  mode: "production",
  devtool: false, // for smaller and faster build times
  // devtool: "source-map"
  plugins: [
    new CleanWebpackPlugin(),
    new ZipPlugin({
      path: path.resolve(__dirname, "dist"),
      filename: zipFileName,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          },
          compress: {
            drop_console: true,
          },
        },
        extractComments: false
      }),
      new CssMinimizerPlugin(),
    ],
  },
});
