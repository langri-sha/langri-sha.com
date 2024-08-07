/**
 * @type {import('lint-staged').Config}
 */
export default {
  '*.{js,cjs,mjs,jsx,ts,mts,tsx}': async (files) => {
    try {
      const { ESLint } = await import('eslint')

      const eslintCli = new ESLint()

      /** @type {[string, boolean][]} */
      const ignored = await Promise.all(
        files.map(async (file) => [file, await eslintCli.isPathIgnored(file)]),
      )
      const filtered = ignored
        .filter(([, isIgnored]) => !isIgnored)
        .map(([file]) => `"${file}"`)

      return `eslint --fix ${filtered.join(' ')}`
    } catch {
      return ''
    }
  },
  '*': async (files) => {
    try {
      const prettier = await import('prettier')
      const options = { ignorePath: './.prettierignore' }

      /** @type {[string, import('prettier').FileInfoResult][]} */
      const ignored = await Promise.all(
        files.map(async (file) => [
          file,
          await prettier.getFileInfo(file, options),
        ]),
      )
      const filtered = ignored
        .filter(([, { ignored }]) => !ignored)
        .map(([file]) => `"${file}"`)

      return filtered.length > 0
        ? `prettier --ignore-unknown --write ${filtered.join(' ')}`
        : []
    } catch {
      return ''
    }
  },
}
