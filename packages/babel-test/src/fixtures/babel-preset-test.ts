import type { ConfigAPI } from '@babel/core'

const config = (
  _api: ConfigAPI,
  options: { foobar?: string },
): { plugins: Array<Array<unknown>> } => ({
  plugins: [
    [
      require.resolve('./babel-plugin-test'),
      { foobar: 'quuxnorf', ...options },
    ],
  ],
})

export default config
