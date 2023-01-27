const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='overlay-content'] -> ::slotted(vaadin-date-picker-overlay-content)
    // https://github.com/vaadin/web-components/pull/3904
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) =>
        node.attribute === "part" && node.value === "overlay-content",
      replacer: () =>
        parser.tag({ value: "vaadin-date-picker-overlay-content" }),
    });
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
