// Line breaks stay, since preprocessor directives end at them.
export const minify = (source: string) =>
  source.replace(/[ \t]*\/\/.*$/gm, '').replace(/^\s+/gm, '')

const glslLoader = (source: string) =>
  `export default ${JSON.stringify(minify(source))}`

export default glslLoader
