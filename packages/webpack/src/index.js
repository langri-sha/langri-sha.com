// @flow

// Stock.
export { default } from 'webpack'
export const { EnvironmentPlugin } = require('webpack')
export type { WebpackOptions } from 'webpack'

// Theirs.
export { CleanWebpackPlugin as CleanPlugin } from 'clean-webpack-plugin'
export { default as CopyPlugin } from 'copy-webpack-plugin'
export { default as HtmlPlugin } from 'html-webpack-plugin'
export { default as TerserPlugin } from 'terser-webpack-plugin'
