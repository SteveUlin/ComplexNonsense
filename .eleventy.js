const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ assets: "/" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/prism-themes/themes/prism-gruvbox-dark.min.css": "css/prism.css",
  });
  eleventyConfig.setServerOptions({
    watch: ["_site/css/tailwind.css"],
  });
  eleventyConfig.addNunjucksFilter("date", require("./filters/day"));

  eleventyConfig.addPlugin(syntaxHighlight);
  return {
    dir: {
      input: "src",
    },
  };
};
