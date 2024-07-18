const rules = require("@typescript-eslint/eslint-plugin").rules

module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "prettier",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "tsconfigRootDir": __dirname,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "ignorePatterns": ['.eslintrc.js'],
    "rules": {
        "@typescript-eslint/member-delimiter-style": [
            "warn",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/naming-convention": [
            "warn",
            ...rules["naming-convention"].defaultOptions,
            {
                "selector": ["enumMember"],
                "format": ["UPPER_CASE"]
            },
            {
                "selector": ["property"],
                "format": ["camelCase", "UPPER_CASE"]
            },
            {
                "selector": ["variable"],
                "modifiers": ["const"],
                "format": ["camelCase", "UPPER_CASE", "PascalCase"]
            }
        ],
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/semi": [
            "warn",
            "always"
        ],
        "curly": "warn",
        "eqeqeq": [  //Triple equals
            "warn",
            "always"
        ],
        "no-redeclare": "warn",
        "no-throw-literal": "warn"
    }
};
