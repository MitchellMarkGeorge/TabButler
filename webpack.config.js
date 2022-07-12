const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')

let isFirefox = process.env.BROWSER === 'firefox';

let manifestPattern = { 
  from: "manifest.json", 
  to: "manifest.json" 
};
let distPath = "dist/chrome";

if(isFirefox){
  manifestPattern = { 
    from: "manifest.firefox.json", 
    to: "manifest.json" 
  };
  distPath = "dist/firefox";
}

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    content: path.resolve(__dirname, `src/content/content.ts`),
    background: path.resolve(__dirname, `src/background/background.ts`),
    welcome: path.resolve(__dirname, `src/welcome/welcome.ts`),
  },
  output: {
    path: path.resolve(__dirname, distPath),
    filename: "[name]/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },

      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"], // can also use style-loader
      },

      {
        test: /\.(png|svg|jpg|gif)$/,
        use: "file-loader",
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: "[name]/[name].css",
    }),

    new HtmlWebpackPlugin({
      title: "Thanks for installing Tab Butler 🥳🤗!",
      filename: path.resolve(__dirname, `${distPath}/welcome/welcome.html`),
      template: `src/welcome/welcome.html`,
      chunks: ["welcome"]
    }),

    new CopyPlugin({
      patterns: [
        manifestPattern,
        { from: "src/icons", to: "icons" },
      ],
    }),
  ],

  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
  },
};
