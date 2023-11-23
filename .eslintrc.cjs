module.exports = {
  root: true,

  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:promise/recommended',
    'prettier',
  ],
  plugins: ['import'],

  ignorePatterns: ['dist', '.eslintrc.*'],

  rules: {
    // common pitfalls
    eqeqeq: 'error',
    curly: 'error',

    // stricter type correctness
    '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
    '@typescript-eslint/no-shadow': [
      'warn',
      {
        ignoreTypeValueShadow: true,
      },
    ],

    // react rules
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    // no sloppiness
    'no-console': ['error', { allow: ['error', 'warn'] }],

    // import rules and fixes
    '@typescript-eslint/consistent-type-imports': 'warn',
    'import/newline-after-import': 'warn',
    'import/order': [
      'warn',
      {
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        distinctGroup: false,
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },

  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.mdx'],
      extends: ['plugin:mdx/recommended'],
      parserOptions: {
        extensions: ['.mdx'],
      },
      rules: {
        'react/jsx-no-undef': 'off',
        'react/no-unescaped-entities': 'off',
        'react/prop-types': 'off',
      },
    },
  ],
};
