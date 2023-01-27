const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='avatar'] -> ::slotted[vaadin-avatar]
    let transformations = [];
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "avatar"
      ) {
        const replacementNode = parser.tag({ value: "vaadin-avatar" });
        convertToSlottedSelector(
          rule,
          transformations,
          attributeNode,
          replacementNode
        );
      }
    });
    transformations.forEach((transformation) => transformation());

    // vaadin-avatar -> ::slotted[vaadin-avatar]
    transformations = [];
    selectors.walkTags((tagNode) => {
      if (tagNode.value === "vaadin-avatar") {
        const replacementNode = parser.tag({ value: "vaadin-avatar" });
        convertToSlottedSelector(
          rule,
          transformations,
          tagNode,
          replacementNode
        );
      }
    });
    transformations.forEach((transformation) => transformation());

    // vaadin-avatar-group-list-box -> ::slotted[vaadin-avatar-group-list-box]
    transformations = [];
    selectors.walkTags((tagNode) => {
      if (tagNode.value === "vaadin-avatar-group-list-box") {
        const replacementNode = parser.tag({
          value: "vaadin-avatar-group-list-box",
        });
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
  postcssPlugin: "vaadin-avatar-group-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
