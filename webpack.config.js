
module.exports = {
  context: __dirname,
  entry: {
    "actor": "./src/actor.js",
    "vat": "./src/vat.js",
    "actors/child": "./actors/child.js",
    "actors/client": "./actors/client.js",
    "actors/dead": "./actors/dead.js",
    "actors/server": "./actors/server.js"
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/build",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: "babel-loader",
          options: {
            presets: [
              "babel-preset-react",
              "babel-preset-es2017"
            ].map(require.resolve)
          }
        }],
      }
    ]
  }
};
