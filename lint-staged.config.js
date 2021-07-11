// @flow
const { ESLint } = require('eslint')
const prettier = require('prettier')

const eslintCli = new ESLint({
  extensions: ['.js', '.jsx'],
})

/* ::
type Config = {
  [pattern: string]:
    | string
    | string[]
    | ((files: string[]) => string | string[] | Promise<string | string[]>)
}
*/

module.exports = ({
  '*.{js,jsx}': async (files) => {
    const filteredFiles = (
      await Promise.all(
        files.map(async (file) => [file, await eslintCli.isPathIgnored(file)])
      )
    )
      .filter(([, isIgnored]) => !isIgnored)
      .map(([file]) => file)

    return `eslint --ext js,jsx --fix ${filteredFiles.join(' ')}`
  },
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
