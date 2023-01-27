const parser = require("postcss-selector-parser");

function getTagSelector(slottedSelector, tagName) {
  const selector = slottedSelector.nodes[0];
  return (
    selector &&
    selector.nodes.find((node) => node.type === "tag" && node.value === tagName)
  );
}

function replaceTagWithSlotAttributeSelector(selectors, tagName, slotName) {
  selectors.walkPseudos((pseudoNode) => {
    if (
      pseudoNode.value === "::slotted" &&
      getTagSelector(pseudoNode, tagName)
    ) {
      const tagNode = getTagSelector(pseudoNode, tagName);
      const replacementNode = parser.attribute({
        attribute: "slot",
        operator: "=",
      });
      replacementNode.setValue(slotName, { quoteMark: '"' });
      tagNode.replaceWith(replacementNode);
    }
  });
}

function createSelectorTransformer(rule) {
  return (selectors) => {
    // ::slotted(vaadin-date-time-picker-date-picker) -> ::slotted([slot='date-picker'])
    // ::slotted(vaadin-date-time-picker-time-picker) -> ::slotted([slot='time-picker'])
    // https://github.com/vaadin/web-components/pull/5251
    replaceTagWithSlotAttributeSelector(
      selectors,
      "vaadin-date-time-picker-date-picker",
      "date-picker"
    );
    replaceTagWithSlotAttributeSelector(
      selectors,
      "vaadin-date-time-picker-time-picker",
      "time-picker"
    );
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-date-time-picker-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
