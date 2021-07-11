// @flow
const prettier = require('prettier')

/* ::
type Config = {
  [pattern: string]:
    | string
    | string[]
    | ((files: string[]) => string | string[] | Promise<string | string[]>)
}
*/

module.exports = ({
  '*.{css,html,json,md,yaml,yml}': async (files) => {
    const options = { ignorePath: './.prettierignore' }
    const promises = files.map((file) => prettier.getFileInfo(file, options))
    const results = await Promise.all(promises)
    const filteredFiles = files.filter((_, index) => !results[index].ignored)
    return filteredFiles.length > 0
      ? `prettier --write ${filteredFiles.join(' ')}`
      : []
  },
} /*: Config */)
