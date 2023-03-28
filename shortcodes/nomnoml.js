const nomnoml = require("nomnoml");
const svgo = require("svgo");

module.exports = (content) => {
  let svg = nomnoml.renderSvg(content);
  return svgo.optimize(svg, { multipass: true }).data;
};
