const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='overlay-content'] -> ::slotted[vaadin-date-picker-overlay-content]
    let transformations = [];
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "overlay-content"
      ) {
        const replacementNode = parser.tag({
          value: "vaadin-date-picker-overlay-content",
        });
        convertToSlottedSelector(rule, transformations, attributeNode, replacementNode);
      }
    });
    transformations.forEach((transformation) => transformation());
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-date-picker-overlay-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
