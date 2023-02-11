const parser = require("postcss-selector-parser");

function getParentSelectors(node) {
  const parents = [];

  while (node.parent) {
    parents.push(node.parent);
    node = node.parent;
  }

  return parents;
}

function stateAttributeMatcher(node) {
  const parentSelectors = getParentSelectors(node);
  const targetsHost = parentSelectors.some(node => node.type === 'pseudo' && node.value === ':host');

  return (
    !targetsHost &&
    ["disabled", "focused", "selected", "today"].includes(node.attribute)
  );
}

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
      if (stateAttributeMatcher(attributeNode)) {
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
