const { migrate } = require("./src/migrate");

const themeLocation = process.argv[2];

migrate(themeLocation, { override: process.argv.includes("--override") });
