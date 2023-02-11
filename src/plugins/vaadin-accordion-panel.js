const parser = require("postcss-selector-parser");
const convertToSlottedSelector = require("./utils/convertToSlottedSelector");
const { Comment } = require("postcss");

function createTodo(rule, text) {
  const todo = new Comment({ text: `TODO: Migration issue: ${text}` });
  rule.parent.insertBefore(rule, todo);
}

function headingMatcher(node) {
  return (
    node.value === "div" &&
    node.next() &&
    node.next().type === "attribute" &&
    node.next().attribute === "role" &&
    node.next().value === "heading"
  );
}

function createSelectorTransformer(rule) {
  return (selectors) => {
    // [part='summary'] -> ::slotted([slot='summary'])
    // https://github.com/vaadin/web-components/pull/5093
    convertToSlottedSelector({
      rule,
      walker: selectors.walkAttributes.bind(selectors),
      matcher: (node) => node.attribute === "part" && node.value === "summary",
      replacer: () => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("summary", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
    });

    // div[role='heading'] -> ::slotted([slot='summary'])
    // https://github.com/vaadin/web-components/pull/5093
    convertToSlottedSelector({
      rule,
      walker: selectors.walkTags.bind(selectors),
      matcher: headingMatcher,
      replacer: () => {
        const replacementNode = parser.selector();
        const attributeNode = parser.attribute({
          attribute: "slot",
          operator: "=",
        });
        attributeNode.setValue("summary", { quoteMark: '"' });
        replacementNode.append(attributeNode);
        return replacementNode;
      },
      customizer: (selector) => {
        // Remove role attribute that is just copied into the new selector otherwise
        const roleAttributeNode = selector.nodes.find(
          (node) => node.type === "attribute" && node.attribute === "role"
        );
        if (roleAttributeNode) {
          roleAttributeNode.remove();
        }
      },
    });

    // [part='toggle'] -> Move to vaadin-accordion-heading.css
    // https://github.com/vaadin/web-components/pull/5093
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "toggle"
      ) {
        createTodo(rule, "Move rule targeting the 'toggle' part to vaadin-accordion-heading.css");
      }
    });

    // [part='summary-content'] -> Move to vaadin-accordion-heading.css
    // https://github.com/vaadin/web-components/pull/5093
    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === "summary-content"
      ) {
        attributeNode.setValue("content");
        createTodo(rule, "Move rules targeting the 'content' part to vaadin-accordion-heading.css");
      }
    });
  };
}

module.exports = () => ({
  postcssPlugin: "vaadin-accordion-panel-plugin",
  Rule(rule) {
    const transformer = createSelectorTransformer(rule);
    const processor = parser(transformer);

    rule.selector = processor.processSync(rule.selector);
  },
});
module.exports.postcss = true;
