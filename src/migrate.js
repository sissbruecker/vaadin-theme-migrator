const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const { getThemeInfo } = require("./theme");

const plugins = [
  require("./plugins/vaadin-avatar-group"),
  require("./plugins/vaadin-date-picker-overlay"),
  require("./plugins/vaadin-date-picker-overlay-content"),
];

async function migrate(themeLocation) {
  const theme = getThemeInfo(themeLocation);

  for (const inputFile of theme.componentFiles) {
    const basename = path.basename(inputFile, ".css");
    const outputFile = path.join(
      theme.componentsPath,
      `${basename}.generated.css`
    );

    const contents = fs.readFileSync(inputFile);

    const output = await postcss(plugins).process(contents, {
      from: inputFile,
      to: outputFile,
    });
    fs.writeFileSync(outputFile, output.css);
  }
}

module.exports = { migrate };
