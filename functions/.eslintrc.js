module.exports = {
    'extends': [
        'prettier'
    ],
    'parserOptions': {
        'ecmaVersion': 2017,
    },
    'plugins': [
        'promise',
        'prettier'
    ],
    'rules': {
        'import/no-extraneous-dependencies': 'off',
        'func-names': 'off',
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
