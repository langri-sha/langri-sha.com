import { expect, test } from 'vitest'

import glslLoader, { minify } from './index'

test('drops comments, indentation and blank lines', () => {
  const source = `#version 300 es

// A comment.
precision highp float;

float twice(float x) {
  // Another.
  return x * 2.0; // Trailing.
}
`

  expect(minify(source)).toBe(`#version 300 es
precision highp float;
float twice(float x) {
return x * 2.0;
}
`)
})

test('exports the minified source as a string', () => {
  expect(glslLoader('// A comment.\nvoid main() {}\n')).toBe(
    'export default "void main() {}\\n"',
  )
})
