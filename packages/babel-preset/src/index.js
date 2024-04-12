// @flow
module.exports = () /*: mixed */ => ({
  presets: [
    ours`@babel/preset-env`,
    ours`@babel/preset-flow`,
    ours`@babel/preset-react`,
  ],
  plugins: [
    [ours`@babel/plugin-proposal-class-properties`, { loose: true }],
    ours`@babel/plugin-proposal-export-default-from`,
    ours`@babel/plugin-proposal-export-namespace-from`,
    ours`@babel/plugin-proposal-object-rest-spread`,
    ours`@babel/plugin-proposal-optional-chaining`,
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
