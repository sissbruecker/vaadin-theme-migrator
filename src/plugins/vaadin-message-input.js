const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // vaadin-message-input-text-area -> ::slotted(vaadin-text-area)
    // https://github.com/vaadin/web-components/pull/4704
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-message-input-text-area",
      replacer: () => {
        return parser.tag({ value: "vaadin-text-area" });
      },
    });

    // vaadin-message-input-button -> ::slotted(vaadin-button)
    // https://github.com/vaadin/web-components/pull/4704
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-message-input-button",
      replacer: () => {
        return parser.tag({ value: "vaadin-button" });
      },
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-message-input-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
