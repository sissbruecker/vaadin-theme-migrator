const { Comment } = require("postcss");

const configs = [
  {
    file: "vaadin-avatar-group.css",
    partName: "avatar",
    element: "vaadin-avatar",
  },
];

function createTodo(rule, config) {
  const text = `TODO: Automatic migration failed. [part='${config.partName}'] should be converted to ::slotted(${config.element})`;
  const todo = new Comment({ text });
  rule.root().insertBefore(rule, todo);
}

function applyConfig(config, rule) {
  const selectorRegex = new RegExp(`\\[part=['"]${config.partName}['"]\\]`);
  if (!rule.selector.match(selectorRegex)) {
    return;
  }

  const selectorList = rule.selector
    .split(",")
    .map((selector) => selector.trim());

  rule.selector = selectorList
    .map((compoundSelector) => {
      const startOfSequenceRegex = new RegExp(`^${selectorRegex.source}`, "g");
      const childSelectors = compoundSelector
        .split(" ")
        .map((childSelector) => {
          if (!childSelector.match(selectorRegex)) {
            return childSelector;
          }
          // Converting wrapped selector is not supported
          if (
            childSelector.match(selectorRegex) &&
            !childSelector.match(startOfSequenceRegex)
          ) {
            createTodo(rule, config);
            return childSelector;
          }

          const remainingSelector = childSelector.replace(
            startOfSequenceRegex,
            ""
          );
          return `::slotted(${config.element}${remainingSelector})`;
        });

      return childSelectors.join(" ");
    })
    .join(", ");
}

module.exports = () => ({
  postcssPlugin: "vaadin-theme-migrator",
  Rule(rule) {
    console.log(`Processing rule: ${rule.selector}`);
    configs.forEach((config) => applyConfig(config, rule));
  },
});
module.exports.postcss = true;
