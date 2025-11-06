module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'linebreak-style': 'off',
  },
};
