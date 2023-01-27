const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='months'] -> ::slotted(vaadin-date-picker-month-scroller)
    // https://github.com/vaadin/web-components/pull/4770
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) => node.attribute === "part" && node.value === "months",
      replacer: () =>
        parser.tag({ value: "vaadin-date-picker-month-scroller" }),
    });

    // [part='years'] -> ::slotted(vaadin-date-picker-year-scroller)
    // https://github.com/vaadin/web-components/pull/4770
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) => node.attribute === "part" && node.value === "years",
      replacer: () => parser.tag({ value: "vaadin-date-picker-year-scroller" }),
    });

    // [part='today-button'] -> ::slotted(vaadin-button[slot='today-button'])
    // https://github.com/vaadin/web-components/pull/4714
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) =>
        node.attribute === "part" && node.value === "today-button",
      replacer: () => {
        const replacementNode = parser.selector();
        replacementNode.append(parser.tag({ value: "vaadin-button" }));
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("today-button", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
    });

    // [part='cancel-button'] -> ::slotted[vaadin-button(slot='cancel-button'])
    // https://github.com/vaadin/web-components/pull/4714
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) =>
        node.attribute === "part" && node.value === "cancel-button",
      replacer: () => {
        const replacementNode = parser.selector();
        replacementNode.append(parser.tag({ value: "vaadin-button" }));
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("cancel-button", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
    });

    // vaadin-button -> ::slotted(vaadin-button)
    // https://github.com/vaadin/web-components/pull/4714
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-button",
      replacer: () => parser.tag({ value: "vaadin-button" }),
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-date-picker-overlay-content-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
