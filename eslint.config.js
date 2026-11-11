import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"
import prettierPlugin from "eslint-plugin-prettier"
import globals from "globals"

import { defineConfig } from "eslint/config"

export default defineConfig(
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "coverage/**",
            "prisma.ignore.config.ts",
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        files: ["public/**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        files: ["**/*.ts"],
        plugins: {
            prettier: prettierPlugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                sourceType: "module",
            },
        },
        rules: {
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "prettier/prettier": "error",
        },
    },
)
