const jest = require("eslint-plugin-jest");
const node = require("eslint-plugin-node");
const prettier = require("eslint-plugin-prettier");

module.exports = [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        node: true,
        jest: true
      }
    },
    plugins: {
      jest,
      node,
      prettier
    },
    rules: {
      "space-before-function-paren": ["off"],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off"
    }
  }
];
