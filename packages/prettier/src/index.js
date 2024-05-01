/** @type {import("prettier").Config} */
const config = {
  iniSpaceAroundEquals: true,
  plugins: ['prettier-plugin-ini'],
  proseWrap: 'always',
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: ['.editorconfig'],
      options: {
        parser: 'ini',
      },
    },
  ],
}

export default config
