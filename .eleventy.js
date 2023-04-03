const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const webc = require("@11ty/eleventy-plugin-webc");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(webc, {
    components: "src/_components/**/*.webc"
  });

  eleventyConfig.addPassthroughCopy({ assets: "/" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/prism-themes/themes/prism-gruvbox-dark.min.css":
      "css/prism.css",
  });
  eleventyConfig.setServerOptions({
    watch: ["_site/css/tailwind.css"],
  });
  eleventyConfig.addPairedShortcode("nomnoml", require("./shortcodes/nomnoml"));

  let options = {
    html: true,
    breaks: false,
    linkify: true,
  };

  eleventyConfig.setLibrary("md", markdownIt(options));
  return {
    dir: {
      input: "src",
    },
  };
};
