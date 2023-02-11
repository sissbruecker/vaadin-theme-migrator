const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const { getThemeInfo } = require("./theme");

const componentPlugins = [
  "vaadin-accordion",
  "vaadin-app-layout",
  "vaadin-avatar-group",
  "vaadin-crud",
  "vaadin-date-picker-overlay",
  "vaadin-date-picker-overlay-content",
  "vaadin-date-time-picker",
  "vaadin-details",
  "vaadin-login-form-wrapper",
  "vaadin-menu-bar",
  "vaadin-message",
  "vaadin-message-avatar",
  "vaadin-message-input",
  "vaadin-message-input-button",
  "vaadin-message-input-text-area",
  "vaadin-message-list",
  "vaadin-month-calendar",
  "vaadin-multi-select-combo-box",
];

function getPlugins(componentFile) {
  const basename = path.basename(componentFile, ".css");

  if (componentPlugins.includes(basename)) {
    return [require(`./plugins/${basename}`)];
  }
  return [];
}

async function migrate(themeLocation, options) {
  options = options || {};
  const theme = getThemeInfo(themeLocation);

  for (const inputFile of theme.componentFiles) {
    const basename = path.basename(inputFile, ".css");
    const outputFile = options.override
      ? inputFile
      : path.join(theme.componentsPath, `${basename}.migrated.css`);

    const contents = fs.readFileSync(inputFile, 'utf8');
    const plugins = getPlugins(inputFile);

    const output = await postcss(plugins).process(contents, {
      from: inputFile,
      to: outputFile,
    });
    if (output.css !== contents) {
      fs.writeFileSync(outputFile, output.css);
    }
  }
}

module.exports = { migrate };
