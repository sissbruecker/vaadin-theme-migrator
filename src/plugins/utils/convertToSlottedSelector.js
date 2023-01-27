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
 */
function convertToSlottedSelector({ rule, walker, matcher, replacer }) {
  const transformations = [];

  walker((visitedNode) => {
    // Node should match matcher
    // Ignore if we are already in a slotted selector
    if (!matcher(visitedNode) || isInSlottedSelector(visitedNode)) {
      return;
    }

    // Extract full compound selector sequence
    const compoundSelector = extractCompoundSelector(visitedNode);

    // Create slotted selector with tag name
    const replacementNode = replacer();
    const slottedNode = parser.pseudo({ value: "::slotted" });
    const slottedSelector = parser.selector();
    slottedNode.append(slottedSelector);
    slottedSelector.append(replacementNode);

    // Clone compound selector into slotted selector
    compoundSelector.forEach((node) => {
      // Ignore current attribute node
      // Ignore tag nodes, makes no sense to combine them with the new slotted selector tag name
      if (node !== visitedNode && node.type !== "tag") {
        slottedSelector.append(node.clone());
      }
    });

    // Replace attribute selector with slotted selector
    transformations.push(() => visitedNode.replaceWith(slottedNode));

    // Remove existing compound selector
    compoundSelector.forEach((node) =>
      transformations.push(() => node.remove())
    );

    // Output warning if there is a combinator after the new ::slotted selector,
    // which is not valid CSS
    if (hasFollowingCombinator(visitedNode)) {
      createTodo(
        rule,
        "Combining selectors after ::slotted() is not supported"
      );
    }

    // Output warning if new slotted selector contains part selector,
    // which is not valid CSS
    if (containsPartSelector(slottedSelector)) {
      createTodo(rule, "Part selector within ::slotted() is not supported");
    }
  });

  // Apply changes after walking AST
  // Doing this during traversal can result in errors
  transformations.forEach((transformation) => transformation());
}

module.exports = convertToSlottedSelector;
