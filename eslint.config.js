const typescript = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const path = require("path");

module.exports = [
  {
    files: ["src/**/*.ts"],
    plugins: {
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: path.resolve(__dirname, "./tsconfig.json"),
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "error",
      "consistent-return": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
  {
    ignores: ["**.js", "dist/**"],
  },
];
