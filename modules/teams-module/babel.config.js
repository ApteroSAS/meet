// babel.config.js
const plugins = [["@babel/plugin-proposal-class-properties"], ["@babel/plugin-transform-typescript"]];

// Instrument for code coverage in development mode
if (process.env.USE_BABEL_PLUGIN_ISTANBUL) {
  console.log("Detected USE_BABEL_PLUGIN_ISTANBUL. Instrumenting code for coverage.");
  plugins.push("babel-plugin-istanbul"); //for coverage
}

module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"],
  plugins,
};
