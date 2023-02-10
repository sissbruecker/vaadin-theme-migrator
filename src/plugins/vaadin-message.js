const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // vaadin-message-avatar -> ::slotted(vaadin-avatar)
    // https://github.com/vaadin/web-components/pull/4702
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-message-avatar",
      replacer: () => {
        return parser.tag({ value: "vaadin-avatar" });
      },
    });

    // [part="avatar"] -> ::slotted(vaadin-avatar)
    // https://github.com/vaadin/web-components/pull/4702
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) => node.attribute === "part" && node.value === "avatar",
      replacer: () => {
        return parser.tag({ value: "vaadin-avatar" });
      },
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-message-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
