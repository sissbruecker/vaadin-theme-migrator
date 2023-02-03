const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function themeMatcher(node) {
  return (
    node.value === "vaadin-button" &&
    node.next() &&
    node.next().type === "attribute" &&
    node.next().attribute === "theme" &&
    node.next().value === "forgot-password"
  );
}

function createSelectorTransformer(rule) {
  return (selectors) => {
    // #forgotPasswordButton -> ::slotted(slot='forgot-password')
    // https://github.com/vaadin/web-components/pull/4890
    convertToSlottedSelector({
      rule,
      walker: selectors.walkIds.bind(selectors),
      matcher: (node) => node.value === "forgotPasswordButton",
      replacer: () => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("forgot-password", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
    });

    // vaadin-button[theme~='forgot-password'] -> ::slotted(slot='forgot-password')
    // https://github.com/vaadin/web-components/pull/4890
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: themeMatcher,
      replacer: () => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("forgot-password", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
      customizer: (selector) => {
        // Remove theme attribute that is just copied into the new selector otherwise
        const themeAttributeNode = selector.nodes.find(
          (node) => node.type === "attribute" && node.attribute === "theme"
        );
        if (themeAttributeNode) {
          themeAttributeNode.remove();
        }
      },
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-login-form-wrapper-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
