const fs = require("fs");
const path = require("path");

function getThemeInfo(location) {
  if (!fs.existsSync(location)) {
    throw new Error(`Theme folder does not exist: ${location}`);
  }

  const componentsPath = path.join(location, "components");
  let componentFiles = [];

  if (fs.existsSync(componentsPath)) {
    componentFiles = fs
      .readdirSync(componentsPath, { withFileTypes: true })
      .filter(
        (item) =>
          item.isFile() &&
          path.extname(item.name) === ".css" &&
          !item.name.includes("migrated.css") &&
          !item.name.includes("snapshot.css")
      )
      .map((item) => path.join(componentsPath, item.name));
  }

  return {
    location,
    componentsPath,
    componentFiles,
  };
}

module.exports = { getThemeInfo };
