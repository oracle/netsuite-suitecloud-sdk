import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';
import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginJestFormatting from 'eslint-plugin-jest-formatting';
import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import eslintTypeScriptParser from '@typescript-eslint/parser';

const languageOptionsJs = {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
        ...globals.amd,
        ...globals.node,
        ...globals.browser,
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    }
};

const pluginsJs = {
    import: eslintPluginImport,
    react: eslintPluginReact,
};
const rulesJs = {
    'no-var': 'error',
    'no-multi-str': 'error',
    'no-prototype-builtins': 'off',
    'no-duplicate-imports': 'error',
    'no-self-compare': 'error',
    'no-sequences': [
        'error',
        {
            allowInParentheses: false,
        },
    ],
    'no-template-curly-in-string': 'error',
    'no-unused-private-class-members': 'error',
    curly: 'error',
    camelcase: [
        'error',
        {
            properties: 'never',
        },
    ],
    'no-extend-native': 'error',
    'max-depth': 'error',
    'dot-notation': 'error',
    eqeqeq: 'error',
    'comma-dangle': ['error', 'only-multiline'],
    'no-constant-condition': [
        'error',
        {
            checkLoops: false,
        },
    ],
    'no-unused-vars': [
        'error',
        {
            args: 'none',
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            ignoreRestSiblings: true,
        },
    ],
    'react/jsx-uses-vars': 2,
};

const pluginsTs = {
    ...pluginsJs,
    '@typescript-eslint': eslintPluginTypeScript,
}

const rulesTs = {
    'block-scoped-var': 'error',
    'prefer-arrow-callback': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    eqeqeq: ['error', 'always', {null: 'ignore'}],
    'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/ban-types': [
        'error',
        {
            types: {
                '{}': false,
            },
            extendDefaults: true,
        },
    ],
    '@typescript-eslint/no-base-to-string': 'warn',
    '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': 'error',
    'require-atomic-updates': [
        'error',
        {
            allowProperties: true,
        },
    ],
    '@typescript-eslint/no-extraneous-class': [
        'error',
        {
            allowEmpty: true,
            allowStaticOnly: true,
        },
    ],
    '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
            assertionStyle: 'as',
            objectLiteralTypeAssertions: 'never',
        },
    ],
    '@typescript-eslint/ban-ts-comment': [
        'error',
        {
            minimumDescriptionLength: 10,
        },
    ],
    '@typescript-eslint/require-await': 'off',
    'no-return-await': 'off',
    '@typescript-eslint/return-await': ['error', 'always'],
    '@typescript-eslint/promise-function-async': ['error'],
    '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
            allowString: true,
            allowNumber: false,
            allowNullableObject: true,
            allowNullableBoolean: false,
            allowNullableString: false,
            allowNullableNumber: false,
            allowNullableEnum: false,
            allowAny: false,
            allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
        },
    ],
    'import/no-unresolved': [
        'warn', { ignore: ['@uif-js/.'] }
    ],
    'import/extensions': [
        'error',
        'ignorePackages',
        {
            '': 'never',
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
        },
    ],
};

const languageOptionsTs = {
    parser: eslintTypeScriptParser,
    parserOptions: {
        project: ['./tsconfig.json'],
    }
}

const settingsTs = {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
        '@typescript-eslint/parser': ['.js', '.ts', '.tsx'],
    },
    'import/resolver': {
        node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
            alwaysTryTypes: true,
            project: './tsconfig.json',
        },
    },
}

const pluginsJsJest = {
    ...pluginsJs,
    jest: eslintPluginJest,
    'jest-formatting': eslintPluginJestFormatting,
};

const rulesJsJest = {
    'jest/consistent-test-it': [
        'error',
        {
            fn: 'test',
            withinDescribe: 'test',
        },
    ],
    'jest-formatting/padding-around-all': 'warn',
    'jest/max-expects': [
        'warn',
        {
            max: 5,
        },
    ],

    'jest/max-nested-describe': [
        'warn',
        {
            max: 5,
        },
    ],
    'jest/no-conditional-in-test': 'warn',
    'jest/no-duplicate-hooks': 'error',
    'jest/no-restricted-matchers': [
        'warn',
        {
            toBeTruthy:
                "For boolean checks is preferred to use toBe(true). Use .toBeTruthy() when you don't care what the value is, there are six falsy values: false, 0, '', null, undefined, and NaN. Everything else is truthy!",
            toBeFalsy:
                "For boolean checks is preferred to use toBe(false), there are six falsy values: false, 0, '', null, undefined, and NaN. Everything else is truthy!",
        },
    ],
    'jest/prefer-comparison-matcher': 'warn',
    'jest/prefer-equality-matcher': 'warn',
    'jest/prefer-hooks-on-top': 'warn',
    'jest/prefer-lowercase-title': [
        'warn',
        {
            ignoreTopLevelDescribe: true, // We want only uppercase for top level Describe
        },
    ],
    'jest/prefer-mock-promise-shorthand': 'warn',
    'jest/prefer-spy-on': 'warn',
    'jest/prefer-todo': 'error',
    'jest/require-to-throw-message': 'warn',
    'jest/valid-title': [
        'error',
        {
            mustNotMatch: [
                '(%#)|(\\$#)',
                "Parameterized tests shouldn't contain test case indexes. It's an anti-pattern which also causes problems on TC and in executing individual tests in IDEs. More info: https://jestjs.io/docs/api#1-testeachtablename-fn-timeout",
            ],
        },
    ],
};

const languageOptionsJsJest = {
    globals: {
        ...globals.jest,
    },
};

export default [
    {
        ignores: ['*', '!src', '!src/SuiteApps', '!src/SuiteApps/*', '!test', '!test/unit', '!test/unit/*'],
        languageOptions: languageOptionsJs,
    },
    {
        files: ['src/SuiteApps/**/*.ts', 'src/SuiteApps/**/*.tsx'],
        ignores: ['src/**/SpaClient.tsx', 'src/**/SpaServer.ts'],
        plugins: pluginsTs,
        rules: {
            ...eslintJs.configs.recommended.rules,
            ...rulesJs,
            ...pluginsJs.import.configs.recommended.rules,
            ...pluginsJs.import.configs.typescript.rules,
            ...eslintPluginTypeScript.configs['eslint-recommended'].rules,
            ...eslintPluginTypeScript.configs.recommended.rules,
            ...eslintPluginTypeScript.configs.stylistic.rules,
            ...rulesTs,
            ...eslintConfigPrettier.rules,
        },
        languageOptions: languageOptionsTs,
        settings: settingsTs,
    },
    {
        files: ['test/unit/**/*.test.ts', 'test/unit/**/*.test.tsx'],
        plugins: pluginsJsJest,
        rules: {

            ...eslintJs.configs.recommended.rules,
            ...rulesJs,
            ...rulesJsJest,
            ...eslintConfigPrettier.rules,
        },
        languageOptions: languageOptionsJsJest,
    },
];