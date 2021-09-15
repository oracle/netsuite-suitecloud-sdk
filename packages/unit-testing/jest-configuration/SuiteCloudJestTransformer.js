const plugins = [];
const presets = [];
presets.push(require("@babel/preset-env"));
plugins.push(require("babel-plugin-transform-amd-to-commonjs"));

module.exports = require("babel-jest").default.createTransformer({
  presets,
  plugins
});
