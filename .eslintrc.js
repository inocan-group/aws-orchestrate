module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    "@antfu/eslint-config-ts",
    "prettier",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "import", "promise"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 12,
  },
  rules: {
    "prefer-const": "error",
    semi: ["error", "always"],
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
  },
};
