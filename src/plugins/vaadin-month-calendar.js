const parser = require("postcss-selector-parser");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='date'] -> [part~='date']
    // https://github.com/vaadin/web-components/pull/4850
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "date"
      ) {
        attributeNode.operator = "~=";
      }
    });

    // [disabled] -> [part~='disabled']
    // [focused] -> [part~='focused']
    // [selected] -> [part~='selected']
    // [today] -> [part~='today']
    // https://github.com/vaadin/web-components/pull/4850
    selectors.walkAttributes((attributeNode) => {
      if (
        ["disabled", "focused", "selected", "today"].includes(
          attributeNode.attribute
        )
      ) {
        const replacementNode = parser.attribute({
          attribute: "part",
          operator: "~=",
        });
        replacementNode.setValue(attributeNode.attribute, { quoteMark: '"' });
        attributeNode.replaceWith(replacementNode);
      }
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-month-calendar-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
