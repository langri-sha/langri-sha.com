const plugin = (): {
  pre: CallableFunction
  post: CallableFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visitor: Record<string, any>
} => ({
  pre: Function.prototype,
  post: Function.prototype,
  visitor: {},
})

export default plugin
