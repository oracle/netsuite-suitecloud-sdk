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
        "@typescript-eslint/naming-convention": "warn",
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
