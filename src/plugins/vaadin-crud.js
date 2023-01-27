const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // vaadin-crud-grid -> ::slotted(vaadin-crud-grid)
    // https://github.com/vaadin/web-components/pull/4723
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-crud-grid",
      replacer: () => parser.tag({ value: "vaadin-crud-grid" }),
    });

    // #grid -> ::slotted(vaadin-crud-grid)
    // https://github.com/vaadin/web-components/pull/4723
    convertToSlottedSelector({
      rule,
      walker: selectors.walkIds.bind(selectors),
      matcher: (node) => node.value === "grid",
      replacer: () => parser.tag({ value: "vaadin-crud-grid" }),
    });

    // vaadin-button -> ::slotted([slot="new-button"])
    // https://github.com/vaadin/web-components/pull/4723
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-button",
      replacer: () => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("new-button", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
    });

    // #new -> ::slotted([slot="new-button"])
    // https://github.com/vaadin/web-components/pull/4723
    convertToSlottedSelector({
      rule,
      walker: selectors.walkIds.bind(selectors),
      matcher: (node) => node.value === "new",
      replacer: () => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("new-button", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
    });

    // [new-button] -> ::slotted([slot="new-button"])
    // https://github.com/vaadin/web-components/pull/4723
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) => node.attribute === "new-button",
      replacer: () => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("new-button", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-crud-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
