const { Comment } = require("postcss");
const parser = require("postcss-selector-parser");

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
  return selector.nodes.some(
    (node) => node.type === "pseudo" && node.value === "::part"
  );
}

function isInSlottedSelector(node) {
  while (node) {
    if (node.type === "pseudo" && node.value === "::slotted") {
      return true;
    }
    node = node.parent;
  }
  return false;
}

function createTodo(rule, text) {
  const todo = new Comment({ text: `TODO: Migration issue: ${text}` });
  rule.root().insertBefore(rule, todo);
}

/**
 * Replaces a selector node, such as an attribute selector, with a slotted selector
 * @param rule The CSS rule that is being processed
 * @param transformations Array to store transformations functions that should be applied after AST traversal
 * @param nodeToReplace The node to replace with a slotted selector
 * @param replacementNode The replacement node that will be the first child of the slotted selector
 */
function convertToSlottedSelector(
  rule,
  transformations,
  nodeToReplace,
  replacementNode
) {
  // Ignore if we are already in a slotted selector
  if (isInSlottedSelector(nodeToReplace)) {
    return;
  }

  // Extract full compound selector sequence
  const compoundSelector = extractCompoundSelector(nodeToReplace);

  // Create slotted selector with tag name
  const slottedNode = parser.pseudo({ value: "::slotted" });
  const slottedSelector = parser.selector();
  slottedNode.append(slottedSelector);
  slottedSelector.append(replacementNode);

  // Clone compound selector into slotted selector
  compoundSelector.forEach((node) => {
    // Ignore current attribute node
    // Ignore tag nodes, makes no sense to combine them with the new slotted selector tag name
    if (node !== nodeToReplace && node.type !== "tag") {
      slottedSelector.append(node.clone());
    }
  });

  // Replace attribute selector with slotted selector
  transformations.push(() => nodeToReplace.replaceWith(slottedNode));

  // Remove existing compound selector
  compoundSelector.forEach((node) => transformations.push(() => node.remove()));

  // Output warning if there is a combinator after the new ::slotted selector,
  // which is not valid CSS
  if (hasFollowingCombinator(nodeToReplace)) {
    createTodo(rule, "Combining selectors after ::slotted() is not supported");
  }

  // Output warning if new slotted selector contains part selector,
  // which is not valid CSS
  if (containsPartSelector(slottedSelector)) {
    createTodo(rule, "Part selector within ::slotted() is not supported");
  }
}

module.exports = convertToSlottedSelector;
