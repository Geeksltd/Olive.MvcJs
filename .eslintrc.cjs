module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    ignorePatterns: ["dist/**", "typings/**", "node_modules/**", "eslint.config.js"],
    rules: {
        "@typescript-eslint/ban-types": "off",
        "prefer-const": "off",
        "no-prototype-builtins": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "no-console": ["warn", { allow: ["warn", "error"] }],
    },
};
