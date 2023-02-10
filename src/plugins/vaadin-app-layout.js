const parser = require("postcss-selector-parser");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='navbar']::before -> [part='navbar']
    // https://github.com/vaadin/web-components/pull/5150
    selectors.walkAttributes((node) => {
      if (
        node.attribute === "part" &&
        node.value === "navbar" &&
        node.next() &&
        node.next().type === "pseudo" &&
        node.next().value === "::before"
      ) {
        node.next().remove();
      }
    });

    // [part='drawer']::before -> [part='drawer']
    // https://github.com/vaadin/web-components/pull/5150
    selectors.walkAttributes((node) => {
      if (
        node.attribute === "part" &&
        node.value === "drawer" &&
        node.next() &&
        node.next().type === "pseudo" &&
        node.next().value === "::before"
      ) {
        node.next().remove();
      }
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-app-layout-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
