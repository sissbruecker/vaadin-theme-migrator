const { Comment } = require("postcss");

module.exports = () => ({
  postcssPlugin: "vaadin-message-input-button-plugin",
  Once(root) {
    const todo = new Comment({
      text: `TODO: Migration issue: The <vaadin-message-input-button> element has been replaced with a regular <vaadin-button>
Move these styles to a global stylesheet and convert the selectors like so:
\`:host\` -> \`vaadin-message-input vaadin-button {...}\`
\`[part="label"]\` -> \`vaadin-message-input vaadin-button::part(label) {...}\``,
    });

    root.prepend(todo);
  },
});
module.exports.postcss = true;
