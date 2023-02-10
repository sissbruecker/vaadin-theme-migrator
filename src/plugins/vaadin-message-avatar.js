const { Comment } = require("postcss");

module.exports = () => ({
  postcssPlugin: "vaadin-message-avatar-plugin",
  Once(root) {
    const todo = new Comment({
      text: `TODO: Migration issue: The <vaadin-message-avatar> element has been replaced with a regular <vaadin-avatar>
Move these styles to a global stylesheet and convert the selectors like so:
\`:host\` -> \`vaadin-message vaadin-avatar {...}\`
\`[part="icon"]\` -> \`vaadin-message vaadin-avatar::part(icon) {...}\``,
    });

    root.prepend(todo);
  },
});
module.exports.postcss = true;
