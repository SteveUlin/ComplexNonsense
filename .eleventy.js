const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const svgo = require("svgo");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ assets: "/" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/prism-themes/themes/prism-gruvbox-dark.min.css":
      "css/prism.css",
  });
  eleventyConfig.setServerOptions({
    watch: ["_site/css/tailwind.css"],
  });
  eleventyConfig.addFilter("date", require("./filters/day"));
  eleventyConfig.addPairedShortcode("nomnoml", (content) => {
    let svg = require("nomnoml").renderSvg(content);
    return svgo.optimize(svg, { multipass: true }).data;
  });

  let options = {
    html: true,
    breaks: false,
    linkify: true,
  };

  eleventyConfig.setLibrary("md", markdownIt(options));
  eleventyConfig.addPlugin(syntaxHighlight);
  return {
    dir: {
      input: "src",
    },
  };
};
