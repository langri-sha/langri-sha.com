'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import fragmentShaderSource from './default.frag'
import vertexShaderSource from './default.vert'

export interface SceneProps {
  audioLevelRef?: React.MutableRefObject<number>
}

export const Scene: React.FC<SceneProps> = ({ audioLevelRef }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let frame = 0
    let dispose: (() => void) | null = null

    const setup = () => {
      const vertexShader = createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexShaderSource,
      )
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

      const positionAttributeLocation = gl.getAttribLocation(
        program,
        'a_position',
      )
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(FULLSCREEN_TRIANGLE),
        gl.STATIC_DRAW,
      )

      gl.useProgram(program)
      gl.enableVertexAttribArray(positionAttributeLocation)
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0,
      )

      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
      const timeLocation = gl.getUniformLocation(program, 'u_time')
      const audioLevelLocation = gl.getUniformLocation(program, 'u_audioLevel')

      const render = (now: DOMHighResTimeStamp) => {
        resize(canvas)

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
        gl.uniform1f(timeLocation, reducedMotion.matches ? 0 : now / 1000)
        gl.uniform1f(audioLevelLocation, audioLevelRef?.current ?? 0)
        gl.drawArrays(gl.TRIANGLES, 0, 3)

        frame = requestAnimationFrame(render)
      }

      frame = requestAnimationFrame(render)

      dispose = () => {
        cancelAnimationFrame(frame)
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
      dispose?.()
      dispose = null
      canvas.style.visibility = 'hidden'
    }

    const handleContextRestored = () => {
      canvas.style.visibility = ''
      setup()
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    setup()

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      dispose?.()
    }
  }, [audioLevelRef])

  return <Canvas ref={canvasRef} />
}

const createShader = (
  gl: WebGL2RenderingContext,
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
  gl: WebGL2RenderingContext,
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

  const scale = Math.min(window.devicePixelRatio, 2)
  const displayWidth = Math.floor(clientWidth * scale)
  const displayHeight = Math.floor(clientHeight * scale)

  if (width !== displayWidth || height !== displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

// A single triangle covering clip space.
const FULLSCREEN_TRIANGLE = [-1, -1, 3, -1, -1, 3]

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
`
