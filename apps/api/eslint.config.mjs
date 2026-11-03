import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginPrettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default {
  files: ["src/**/*.ts", "test/**/*.ts",],
  ignores: ["node_modules/", "dist/", "prisma/**/*.ts", "src/**/*.spec.ts"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: "tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
      sourceType: "module",
    },
  },
  plugins: {
    "@typescript-eslint": tseslint,
    prettier: eslintPluginPrettier,
  },
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "curly": "error",
    "no-console": "error",
    "prettier/prettier": "error",
  },
  settings: {
    prettier: prettierConfig,
  },
};
