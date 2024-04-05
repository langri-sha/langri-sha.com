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
    const ignored = await Promise.all(
      files.map(async (file) => [file, await eslintCli.isPathIgnored(file)])
    )
    const filtered = ignored
      .filter(([, isIgnored]) => !isIgnored)
      .map(([file]) => file)

    return `eslint --ext js,jsx --fix ${filtered.join(' ')}`
  },
  '*.{css,html,json,md,yaml,yml}': async (files) => {
    const options = { ignorePath: './.prettierignore' }

    const ignored = await Promise.all(
      files.map(async (file) => [
        file,
        await prettier.getFileInfo(file, options),
      ])
    )
    const filtered = ignored
      .filter(([, { ignored }]) => !ignored)
      .map(([file]) => file)

    return filtered.length > 0 ? `prettier --write ${filtered.join(' ')}` : []
  },
} /*: Config */)
