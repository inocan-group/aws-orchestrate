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
    quotes: ["warn", "double"],
    "no-unused-vars": "off",
    // we need exceptions to be only "warn" because
    // there are valid use cases for generic variables being
    // used before being defined
    "no-use-before-define": ["warn"],
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    // "cases" allows for graceful use of that variable
    // name in Typescript test cases
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "cases|^_",
        argsIgnorePattern: "^_",
      },
    ],
  },
};
