// Currently unused. Keeping this for future.
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-idiomatic-order',
  ],
  rules: {
    'selector-class-pattern': null,
    'no-invalid-double-slash-comments': null,
  },
  overrides: [
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],
};
