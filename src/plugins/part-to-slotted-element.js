const { Comment } = require("postcss");
const parser = require("postcss-selector-parser");

const configs = [
  {
    file: "vaadin-avatar-group.css",
    partName: "avatar",
    element: "vaadin-avatar",
  },
];

// ':host vaadin-avatar[part='avatar']:not(:first-child) .foo' -> 'vaadin-avatar[part='avatar']:not(:first-child)'
function extractCompoundSelector(childNode) {
  const sequence = [];

  // Find selector start
  let currentNode = childNode;
  while (currentNode.prev() && currentNode.prev().type !== "combinator") {
    currentNode = currentNode.prev();
  }

  // Collect nodes until next combinator, or end
  while (currentNode && currentNode.type !== "combinator") {
    sequence.push(currentNode);
    currentNode = currentNode.next();
  }

  return sequence;
}

function hasFollowingCombinator(childNode) {
  let currentNode = childNode;

  while (currentNode) {
    if (currentNode.type === "combinator") {
      return true;
    }
    currentNode = currentNode.next();
  }

  return false;
}

function containsPartSelector(selector) {
  return selector.nodes.some(node => node.type === 'pseudo' && node.value === '::part')
}

function createSelectorTransformer(config, rule) {
  return (selectors) => {
    const nodesToReplace = [];
    let nodesToRemove = [];

    selectors.walkAttributes((attributeNode) => {
      if (
        attributeNode.attribute === "part" &&
        attributeNode.value === config.partName
      ) {
        // Extract full compound selector sequence
        const compoundSelector = extractCompoundSelector(attributeNode);

        // Create slotted selector with tag name
        const slottedNode = parser.pseudo({ value: "::slotted" });
        const slottedSelector = parser.selector();
        const tagNode = parser.tag({ value: config.element });
        slottedNode.append(slottedSelector);
        slottedSelector.append(tagNode);

        // Clone compound selector into slotted selector
        compoundSelector.forEach((node) => {
          // Ignore current attribute node
          // Ignore tag nodes, makes no sense to combine them with the new slotted selector tag name
          if (node !== attributeNode && node.type !== "tag") {
            slottedSelector.append(node.clone());
          }
        });

        // Replace attribute selector with slotted selector
        nodesToReplace.push([attributeNode, slottedNode]);

        // Remove existing compound selector
        nodesToRemove = [...nodesToRemove, ...compoundSelector];

        // Output warning if there is a combinator after the new ::slotted selector,
        // which is not valid CSS
        if (hasFollowingCombinator(attributeNode)) {
          createTodo(
            rule,
            config,
            "Combining selectors after ::slotted() is not supported"
          );
        }

        // Output warning if new slotted selector contains part selector,
        // which is not valid CSS
        if (containsPartSelector(slottedSelector)) {
          createTodo(
            rule,
            config,
            "Part selector within ::slotted() is not supported"
          );
        }
      }
    });

    // Apply AST changes after traversal
    // Doing this during traversal can result in errors
    nodesToReplace.forEach((nodes) => nodes[0].replaceWith(nodes[1]));
    nodesToRemove.forEach((node) => node.remove());
  };
}

function createTodo(rule, config, text) {
  const todo = new Comment({ text: `TODO: Migration issue: ${text}` });
  rule.root().insertBefore(rule, todo);
}

module.exports = () => ({
  postcssPlugin: "vaadin-theme-migrator",
  Rule(rule) {
    configs.forEach((config) => {
      const transformer = createSelectorTransformer(config, rule);
      const processor = parser(transformer);

      rule.selector = processor.processSync(rule.selector);
    });
  },
});
module.exports.postcss = true;
