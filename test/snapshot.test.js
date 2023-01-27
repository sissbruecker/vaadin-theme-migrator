const fs = require("fs");
const path = require("path");
const { expect } = require("chai");
const { migrate } = require("../src/migrate");
const { getThemeInfo } = require("../src/theme");

describe("snapshots", () => {
  const themePath = path.resolve("test/fixtures/snapshot-theme");
  const theme = getThemeInfo(themePath);

  function clearMigratedFiles() {
    fs.readdirSync(theme.componentsPath, { withFileTypes: true })
      .filter((item) => item.isFile() && item.name.includes(".generated.css"))
      .forEach((file) =>
        fs.unlinkSync(path.join(theme.componentsPath, file.name))
      );
  }

  before(async () => {
    clearMigratedFiles();
    await migrate(themePath);
  });

  theme.componentFiles.forEach((componentFile) => {
    const basename = path.basename(componentFile, ".css");

    it(`should migrate '${basename}' component file`, () => {
      const outputFile = path.join(
        theme.componentsPath,
        `${basename}.generated.css`
      );
      const snapshotFile = path.join(
        theme.componentsPath,
        `${basename}.snapshot.css`
      );

      if (!fs.existsSync(outputFile)) {
        throw new Error(`Output file does not exist: ${outputFile}`);
      }
      if (!fs.existsSync(snapshotFile)) {
        throw new Error(`Snapshot file does not exist: ${snapshotFile}`);
      }
      const output = fs.readFileSync(outputFile, "utf8");
      const snapshot = fs.readFileSync(snapshotFile, "utf8");
      expect(output).to.equal(snapshot);
    });
  });
});
