const { Comment } = require("postcss");

module.exports = () => ({
  postcssPlugin: "vaadin-message-input-text-area-plugin",
  Once(root) {
    const todo = new Comment({
      text: `TODO: Migration issue: The <vaadin-message-input-text-area> element has been replaced with a regular <vaadin-text-area>
Move these styles to a global stylesheet and convert the selectors like so:
\`:host\` -> \`vaadin-message-input vaadin-text-area {...}\`
\`[part="input-field"]\` -> \`vaadin-message-input vaadin-text-area::part(input-field) {...}\``,
    });

    root.prepend(todo);
  },
});
module.exports.postcss = true;
