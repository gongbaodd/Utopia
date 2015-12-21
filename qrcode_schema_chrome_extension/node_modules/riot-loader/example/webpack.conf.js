var path = require('path');

module.exports = {
  context: __dirname,
  entry: path.join(__dirname, "bundle.js"),
  output: {
    path: path.join(__dirname),
    filename: "bundle.out.js"
  },

  module: {
    loaders: [
      { test: /\.tag$/, loader: "riot-loader" }
    ],
  }
}
