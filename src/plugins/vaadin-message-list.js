const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // vaadin-message -> ::slotted(vaadin-message)
    // https://github.com/vaadin/web-components/pull/4710
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-message",
      replacer: () => {
        return parser.tag({ value: "vaadin-message" });
      },
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-message-list-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
