module.exports = {
  extends: ['welly'],
  rules: {
    camelcase: 'off',
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'testing-library/render-result-naming-convention': 'off',
    'jest/no-deprecated-functions': 'off',
  },
  overrides: [
    {
      files: ['tsup.config.ts', '**/*.test.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
