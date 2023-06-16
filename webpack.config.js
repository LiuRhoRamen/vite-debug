const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "wp.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "umd",
      name: "test",
    },
    // prevent error: `Uncaught ReferenceError: self is not define`
    globalObject: "this",
  },
  optimization: {
    minimize: false,
  },
};
