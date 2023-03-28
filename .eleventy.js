const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");

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
  eleventyConfig.addShortcode("hashgrid", require("./shortcodes/hashgrid"));
  eleventyConfig.addPairedShortcode("nomnoml", require("./shortcodes/nomnoml"));

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
