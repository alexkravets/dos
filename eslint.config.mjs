import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.mocha,
        },

        ecmaVersion: 2018,
        sourceType: "commonjs",
    },

    rules: {
        "comma-style": "error",
        "consistent-this": ["error", "_this"],

        indent: ["error", 2, {
            SwitchCase: 1,
            VariableDeclarator: 2,
        }],

        "keyword-spacing": "error",
        "no-multi-spaces": "off",
        "no-spaced-func": "error",
        "no-trailing-spaces": "error",
        quotes: ["error", "single"],
        semi: ["error", "never"],
        curly: ["error"],
        "prefer-arrow-callback": "error",
        "space-before-blocks": "error",

        "space-before-function-paren": [1, {
            anonymous: "always",
            named: "never",
        }],

        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "no-return-await": "error",
        eqeqeq: "error",
    },
}];