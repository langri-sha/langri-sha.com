import styled from '@emotion/styled'
import * as React from 'react'

import fragmentShaderSource from './default.frag'
import vertexShaderSource from './default.vert'

export const Scene: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    const gl = canvasRef.current.getContext('webgl')
    if (!gl) return

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    )

    if (!vertexShader || !fragmentShader) {
      return
    }

    const program = createProgram(gl, vertexShader, fragmentShader)

    if (!program) {
      return
    }

    const positions = [0, 0, 0, 0.5, 0.7, 0]
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      'a_position',
    )
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    resize(canvasRef.current)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)

    gl.enableVertexAttribArray(positionAttributeLocation)
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const size = 2 // 2 components per iteration
    const type = gl.FLOAT // The data is 32bit floats
    const normalize = false // Don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      0,
    )

    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 3
    gl.drawArrays(primitiveType, offset, count)
  }, [])

  return <Canvas ref={canvasRef} />
}

const createShader = (
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

const createProgram = (
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

const resize = (canvas: HTMLCanvasElement) => {
  const { width, height, clientWidth, clientHeight } = canvas

  const displayWidth = Math.floor(clientWidth * window.devicePixelRatio)
  const displayHeight = Math.floor(clientHeight * window.devicePixelRatio)

  if (width !== displayWidth || height !== displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
`
