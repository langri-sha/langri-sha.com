// @flow
declare var module: {
  ...module,
  hot?: {
    accept(path: string, callback: Function): void,
  },
}

declare function ga(...any[]): void
