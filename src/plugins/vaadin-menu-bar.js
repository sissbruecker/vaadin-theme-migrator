const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // vaadin-menu-bar-button -> ::slotted(vaadin-menu-bar-button)
    // https://github.com/vaadin/web-components/pull/4687
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-menu-bar-button",
      replacer: () => {
        return parser.tag({ value: "vaadin-menu-bar-button" });
      },
    });

    // [part="menu-bar-button"] -> ::slotted(vaadin-menu-bar-button)
    // https://github.com/vaadin/web-components/pull/4687
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) =>
        node.attribute === "part" && node.value === "menu-bar-button",
      replacer: () => {
        return parser.tag({ value: "vaadin-menu-bar-button" });
      },
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-menu-bar-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
