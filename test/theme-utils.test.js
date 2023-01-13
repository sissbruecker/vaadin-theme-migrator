const path = require("path");
const { expect } = require("chai");
const themeUtils = require("../src/theme");

describe("theme-utils", () => {
  describe("getThemeInfo", () => {
    it("should work with empty theme", () => {
      const themePath = path.resolve("test", "fixtures", "empty-theme");
      const theme = themeUtils.getThemeInfo(themePath);

      expect(theme.location).to.equal(themePath);
      expect(theme.componentsPath).to.equal(path.join(themePath, "components"));
      expect(theme.componentFiles).to.eql([]);
    });

    it("should fail for non-existing theme", () => {
      const themePath = path.resolve("test", "fixtures", "does-not-exist");
      expect(() => {
        themeUtils.getThemeInfo(themePath);
      }).to.throw(/Theme folder does not exist/);
    });

    it("should work with theme with contents", () => {
      const themePath = path.resolve("test", "fixtures", "theme-with-contents");
      const theme = themeUtils.getThemeInfo(themePath);

      expect(theme.location).to.equal(themePath);
      expect(theme.componentsPath).to.equal(path.join(themePath, "components"));
      expect(theme.componentFiles).to.eql([
        path.join(themePath, "components", "vaadin-avatar.css"),
        path.join(themePath, "components", "vaadin-button.css"),
      ]);
    });
  });
});
