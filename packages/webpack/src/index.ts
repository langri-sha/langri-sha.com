import path from 'path'

import type { Configuration, ResolveOptions } from 'webpack'

// Stock.
export { default, EnvironmentPlugin, type Configuration } from 'webpack'

// Theirs.
export { CleanWebpackPlugin as CleanPlugin } from 'clean-webpack-plugin'
export { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity'
export { default as CopyPlugin } from 'copy-webpack-plugin'
export { default as HtmlPlugin } from 'html-webpack-plugin'
export { default as TerserPlugin } from 'terser-webpack-plugin'

/**
 * Reusable resolve settings.
 */
export const resolve: Configuration['resolve'] = {
  extensions: ['.tsx', '.ts', '.js'],
}

// Resolve Webpack loaders from this package first.
export const resolveLoader: ResolveOptions = {
  modules: [path.join(__dirname, '..', 'node_modules'), 'node_modules'],
}
