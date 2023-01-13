const { migrate } = require("./src/migrate");

// hard-coded for now
const themeLocation = "test/fixtures/snapshot-theme";

async function run() {
  await migrate(themeLocation);
}

run();
