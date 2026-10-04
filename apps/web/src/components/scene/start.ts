export interface SceneHandle {
  audioLevelRef?: { current: number }
  dispose: () => void
}

export const start = (
  canvas: HTMLCanvasElement,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): SceneHandle | undefined => {
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false })
  if (!gl) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handle: SceneHandle = { dispose: () => {} }

  let frame = 0
  let release: (() => void) | null = null

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)

    if (shader) {
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
    }

    return shader
  }

  const setup = () => {
    const vertexShader = compile(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) {
      return
    }

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(
        gl.getShaderInfoLog(vertexShader),
        gl.getShaderInfoLog(fragmentShader),
        gl.getProgramInfoLog(program),
      )
      gl.deleteProgram(program)
      return
    }

    const vertexArray = gl.createVertexArray()
    gl.bindVertexArray(vertexArray)

    // A single triangle covering clip space.
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )

    gl.useProgram(program)
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      'a_position',
    )
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const audioLevelLocation = gl.getUniformLocation(program, 'u_audioLevel')

    const render = (now: DOMHighResTimeStamp) => {
      const scale = Math.min(window.devicePixelRatio, 2)
      const width = Math.floor(canvas.clientWidth * scale)
      const height = Math.floor(canvas.clientHeight * scale)

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      gl.viewport(0, 0, width, height)
      gl.uniform2f(resolutionLocation, width, height)
      gl.uniform1f(timeLocation, reducedMotion.matches ? 0 : now / 1000)
      gl.uniform1f(audioLevelLocation, handle.audioLevelRef?.current ?? 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      frame = requestAnimationFrame(render)
    }

    frame = requestAnimationFrame(render)

    release = () => {
      cancelAnimationFrame(frame)
      gl.deleteVertexArray(vertexArray)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }

  // The browser can evict the context under GPU pressure, leaving the
  // canvas as an opaque broken-canvas placeholder. Hide it so the CSS
  // gradient shows through until the context comes back.
  const handleContextLost = (event: Event) => {
    event.preventDefault()
    release?.()
    release = null
    canvas.style.visibility = 'hidden'
  }

  const handleContextRestored = () => {
    canvas.style.visibility = ''
    setup()
  }

  canvas.addEventListener('webglcontextlost', handleContextLost)
  canvas.addEventListener('webglcontextrestored', handleContextRestored)

  setup()

  handle.dispose = () => {
    canvas.removeEventListener('webglcontextlost', handleContextLost)
    canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    release?.()
  }

  return handle
}
