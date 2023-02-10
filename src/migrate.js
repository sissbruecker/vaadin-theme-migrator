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
  "vaadin-month-calendar",
];

function getPlugins(componentFile) {
  const basename = path.basename(componentFile, ".css");

  if (componentPlugins.includes(basename)) {
    return [require(`./plugins/${basename}`)];
  }
  return [];
}

async function migrate(themeLocation) {
  const theme = getThemeInfo(themeLocation);

  for (const inputFile of theme.componentFiles) {
    const basename = path.basename(inputFile, ".css");
    const outputFile = path.join(
      theme.componentsPath,
      `${basename}.generated.css`
    );

    const contents = fs.readFileSync(inputFile);
    const plugins = getPlugins(inputFile);

    const output = await postcss(plugins).process(contents, {
      from: inputFile,
      to: outputFile,
    });
    fs.writeFileSync(outputFile, output.css);
  }
}

module.exports = { migrate };
