module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  rules: {
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: 'useAsyncFn',
      },
    ],
  },
});
