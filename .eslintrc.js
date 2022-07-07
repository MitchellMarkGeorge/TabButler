module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  env: {
    browser: true,
  },
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    // this is off as the are places in the code where other factors gurantee a fields existence that the typesystem doesn't know about
  },
};
