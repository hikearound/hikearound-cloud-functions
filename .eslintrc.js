module.exports = {
    'extends': [
        'eslint:recommended',
        'airbnb',
        'prettier',
    ],
    'parserOptions': {
        'ecmaVersion': 2017,
    },
    'plugins': [
        'promise',
        'prettier',
        'jest',
    ],
    'env': {
        'jest/globals': true,
    },
    'globals': {
        'before': true,
        'after': true,
    },
    'settings': {
        'react': {
            'version': 'latest',
        },
    },
    'rules': {
        'import/no-extraneous-dependencies': 'off',
        'guard-for-in': 'off',
        'no-continue': 'off',
        'func-names': 'off',
        'no-restricted-syntax': 'off',
        'comma-dangle': ['error', 'always-multiline'],
        'no-await-in-loop': 'off',
        'no-param-reassign': 'off',
        'semi': ['error', 'always'],
        'prettier/prettier': [
            'error',
            {
                'trailingComma': 'all',
                'singleQuote': true,
                'printWidth': 80,
                'semi': true,
                'jsxBracketSameLine': false,
                'tabWidth': 4,
                'arrowParens': 'always',
            }
        ],
    }
};
