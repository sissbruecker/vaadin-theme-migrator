const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='avatar'] -> ::slotted(vaadin-avatar)
    // https://github.com/vaadin/web-components/pull/4723
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) => node.attribute === "part" && node.value === "avatar",
      replacer: () => parser.tag({ value: "vaadin-avatar" }),
    });

    // vaadin-avatar -> ::slotted(vaadin-avatar)
    // https://github.com/vaadin/web-components/pull/4723
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-avatar",
      replacer: () => parser.tag({ value: "vaadin-avatar" }),
    });

    // vaadin-avatar-group-list-box -> ::slotted(vaadin-avatar-group-list-box)
    // https://github.com/vaadin/web-components/pull/3905
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: (node) => node.value === "vaadin-avatar-group-list-box",
      replacer: () => parser.tag({ value: "vaadin-avatar-group-list-box" }),
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-avatar-group-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
