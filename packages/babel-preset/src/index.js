/**
 * @type {import('@babel/core').ConfigFunction}
 */
module.exports = (api) => ({
  presets: [
    ours`@babel/preset-env`,
    ours`@babel/preset-flow`,
    ours`@babel/preset-react`,
    [
      ours`@babel/preset-typescript`,
      {
        onlyRemoveTypeImports: true,
      },
    ],
  ],
  plugins: [
    ours`@babel/plugin-proposal-export-default-from`,
    ours`@emotion/babel-plugin`,
  ],
})

/**
 * Forces Babel to resolve packages relative to this module, instead of where `@babel/core` is invoked.
 *
 * @param {TemplateStringsArray} strings
 * @returns String
 */
const ours = ([pkg]) => require.resolve(pkg)
