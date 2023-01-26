const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='months'] -> ::slotted[vaadin-date-picker-month-scroller]
    let transformations = [];
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "months"
      ) {
        const replacementNode = parser.tag({
          value: "vaadin-date-picker-month-scroller",
        });
        convertToSlottedSelector(rule, transformations, attributeNode, replacementNode);
      }
    });
    transformations.forEach((transformation) => transformation());

    // [part='years'] -> ::slotted[vaadin-date-picker-year-scroller]
    transformations = [];
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "years"
      ) {
        const replacementNode = parser.tag({
          value: "vaadin-date-picker-year-scroller",
        });
        convertToSlottedSelector(rule, transformations, attributeNode, replacementNode);
      }
    });
    transformations.forEach((transformation) => transformation());

    // [part='today-button'] -> ::slotted[vaadin-button[slot='today-button']]
    transformations = [];
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "today-button"
      ) {
        const replacementNode = parser.selector();
        replacementNode.append(parser.tag({ value: "vaadin-button" }));
        replacementNode.append(
          parser.attribute({
            attribute: "slot",
            value: '"today-button"',
            operator: "=",
          })
        );
        convertToSlottedSelector(
          rule,
          transformations,
          attributeNode,
          replacementNode
        );
      }
    });
    transformations.forEach((transformation) => transformation());

    // [part='cancel-button'] -> ::slotted[vaadin-button[slot='cancel-button']]
    transformations = [];
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "cancel-button"
      ) {
        const replacementNode = parser.selector();
        replacementNode.append(parser.tag({ value: "vaadin-button" }));
        replacementNode.append(
          parser.attribute({
            attribute: "slot",
            value: '"cancel-button"',
            operator: "=",
          })
        );
        convertToSlottedSelector(
          rule,
          transformations,
          attributeNode,
          replacementNode
        );
      }
    });
    transformations.forEach((transformation) => transformation());

    // vaadin-button -> ::slotted[vaadin-button]
    transformations = [];
    selectors.walkTags((tagNode) => {
      if (tagNode.value === "vaadin-button") {
        const replacementNode = parser.tag({ value: "vaadin-button" });
        convertToSlottedSelector(
          rule,
          transformations,
          tagNode,
          replacementNode
        );
      }
    });
    transformations.forEach((transformation) => transformation());
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
