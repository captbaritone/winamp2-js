const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const UnminifiedWebpackPlugin = require("unminified-webpack-plugin");

module.exports = {
  devtool: "source-map",
  mode: "production",
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          // We really only need this in prod. We could find a way to disable it in dev.
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("cssnano"),
                require("../scripts/postcss-optimize-data-uri-pngs")
              ]
            }
          }
        ]
      },
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            envName: "library"
          }
        }
      }
    ],
    noParse: [/jszip\.js$/]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: "library-report.html",
      openAnalyzer: false
    }),
    // Also generate non-minified bundles.
    new UnminifiedWebpackPlugin()
  ],
  performance: {
    // We do some crazy shit okay! Don't judge!
    maxEntrypointSize: 9000000,
    maxAssetSize: 9000000
  },
  entry: {
    "bundle.min": "./js/webamp.ts",
    "lazy-bundle.min": "./js/webampLazy.tsx"
  },
  output: {
    path: path.resolve(__dirname, "../built"),
    filename: "webamp.[name].js",
    library: "Webamp",
    libraryTarget: "umd",
    libraryExport: "default"
  }
};
