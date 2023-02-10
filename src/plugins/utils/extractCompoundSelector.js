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

module.exports = extractCompoundSelector;
