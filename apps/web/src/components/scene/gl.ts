export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type)

  if (!shader) {
    return
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) => {
  const program = gl.createProgram()

  if (!program || !vertexShader || !fragmentShader) {
    return
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)

  if (success) {
    return program
  }

  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

// Render at device resolution but cap the pixel ratio, with a scale knob to
// trade sharpness for performance if a machine struggles.
const RENDER_SCALE = 1

export const resize = (canvas: HTMLCanvasElement) => {
  const { width, height, clientWidth, clientHeight } = canvas

  const scale = Math.min(window.devicePixelRatio, 2) * RENDER_SCALE
  const displayWidth = Math.floor(clientWidth * scale)
  const displayHeight = Math.floor(clientHeight * scale)

  if (width !== displayWidth || height !== displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

// A single triangle covering clip space.
export const FULLSCREEN_TRIANGLE = [-1, -1, 3, -1, -1, 3]
