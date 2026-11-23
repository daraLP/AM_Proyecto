const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  { ignores: ["dist/*", "supabase/*", ".expo/*", "node_modules/*", "jest.setup.js", "jest.config.js"] },
];
