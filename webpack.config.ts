import path from "path";
import webpack from "webpack";
import WebpackUserscript from "webpack-userscript";
import pkg from "./package.json";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type WebpackDevServerOptions } from "webpack-cli";

const isProductionBuild = process.env.NODE_ENV === "production";
const dist = path.resolve(__dirname, "dist");

const config: webpack.Configuration = {
  entry: path.resolve(__dirname, "src", "aiFormHelper.ts"),
  devtool: "inline-source-map",
  output: {
    path: dist,
    filename: `${pkg.name}.user.js`,
  },
  resolve: {
    extensions: [".ts", ".js"],
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: { transpileOnly: true },
          },
        ],
      },
    ],
  },
  devServer: {
    static: dist,
    webSocketServer: false,
    client: false,
    devMiddleware: { writeToDisk: true },
    hot: false,
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new WebpackUserscript({
      headers: {
        version: !isProductionBuild ? `[version]-build.[buildNo]` : `[version]`,
        grant: ["GM_addElement"],
        match: "https://*/*",
      },
      proxyScript: {
        filename: "[basename].proxy.user.js",
      },
    }),
  ],
};

export default config;
