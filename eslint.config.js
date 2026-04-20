import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-plugin-prettier";

export default [
  {
    ignores: ["scripts/**", "dist/**"],
  },
  js.configs.recommended,
  {
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.jest,
        App: "readonly",
        Constants: "readonly",
        StorageUtil: "readonly",
        ParserUtil: "readonly",
        ValidatorUtil: "readonly",
        StatusComponent: "readonly",
        ConfigComponent: "readonly",
        GuessesComponent: "readonly",
        LettersComponent: "readonly",
        ValidatorComponent: "readonly",
        ShareComponent: "readonly",
      },
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-misleading-character-class": "off",
      indent: "off",
      "linebreak-style": "off",
      quotes: "off",
      semi: "off",
    },
  },
];
