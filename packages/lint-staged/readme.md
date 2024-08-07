# @langri-sha/lint-staged

A [`lint-staged`] configuration for running [ESLint] and [Prettier] on
pre-commit hooks with [Husky], respecting ignored files.

## Usage

Install the required dependencies:

```sh
npm install -D eslint prettier husky lint-staged @langri-sha/lint-staged
```

Then add your configuration:

```js
// lint-staged.config.(m)js
import config from '@langri-sha/lint-staged'

export default {
  ...config,
  /* ... */
}
```

Configure Husky:

```
echo "npm -q lint-staged" > .husky-precommit
```

[`lint-staged`]: https://github.com/lint-staged/lint-staged
[eslint]: https://eslint.org/docs/latest/use/getting-started
[husky]: https://typicode.github.io/husky/get-started.html
[prettier]: https://prettier.io/docs/en/
