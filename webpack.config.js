
module.exports = {
  context: __dirname,
  entry: {
    actor: "./src/actor.js",
    vat: "./src/vat.js"
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/build",
  }
};

