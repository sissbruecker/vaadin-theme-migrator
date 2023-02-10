const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");
const extractCompoundSelector = require("./utils/extractCompoundSelector");

function hasOverflowPart(node) {
  const compoundSelector = extractCompoundSelector(node);
  return compoundSelector.some(
    (sibling) =>
      sibling.type === "attribute" &&
      sibling.attribute === "part" &&
      sibling.value.includes("overflow")
  );
}

function createSelectorTransformer(rule) {
  return (selectors) => {
    // vaadin-multi-select-combo-box -> [part="chip"]
    // https://github.com/vaadin/web-components/pull/4832
    selectors.walkTags((node) => {
      if (node.value === "vaadin-multi-select-combo-box-chip") {
        const attributeNode = parser.attribute({
          attribute: "part",
          operator: "=",
        });
        attributeNode.setValue("chip", { quoteMark: '"' });

        node.replaceWith(attributeNode);
      }
    });

    // [part="overflow-one"] -> [part="overflow"][count="1"]
    selectors.walkAttributes((node) => {
      if (
        node.type === "attribute" &&
        node.attribute === "part" &&
        ["overflow-one", "overflow-two", "overflow-three"].includes(node.value)
      ) {
        const count = node.value.includes("overflow-one")
          ? 1
          : node.value.includes("overflow-two")
          ? 2
          : 3;
        const overflowPartNode = parser.attribute({
          attribute: "part",
          operator: "=",
        });
        overflowPartNode.setValue("overflow", { quoteMark: '"' });

        const countPartNode = parser.attribute({
          attribute: "count",
          operator: "=",
        });
        countPartNode.setValue(count.toString(), { quoteMark: '"' });

        node.replaceWith(overflowPartNode);
        overflowPartNode.parent.insertAfter(overflowPartNode, countPartNode);
      }
    });

    // [part="chip"] -> ::slotted([slot="chip"])
    // [part="overflow"] -> ::slotted([slot="overflow"])
    // [part="overflow"][count="1"] -> ::slotted([slot="overflow"][count="1"])
    // https://github.com/vaadin/web-components/pull/4832
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) =>
        node.attribute === "part" &&
        (node.value === "chip" || node.value.includes("overflow")),
      replacer: (node) => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        const slotName = hasOverflowPart(node) ? "overflow" : "chip";
        attributeNode.setValue(slotName, { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
      customizer(slottedSelector) {
        // remove all remaining chip / overflow parts
        const obsoleteParts = slottedSelector.nodes.filter(
          (node) =>
            node.type === "attribute" &&
            node.attribute === "part" &&
            (node.value === "chip" || node.value.includes("overflow"))
        );
        obsoleteParts.forEach((part) => part.remove());
      },
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-multi-select-combo-box-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
