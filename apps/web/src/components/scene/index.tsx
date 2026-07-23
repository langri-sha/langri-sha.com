import styled from '@emotion/styled'
import * as React from 'react'

import fragmentShaderSource from './default.frag'
import vertexShaderSource from './default.vert'

// The wind scroll and camera yaw are wrapped to this period so shader float
// precision holds up as the clock grows. Matches CYCLE_SECONDS in the shader.
const CYCLE = 256

export interface SceneProps {
  audioLevelRef: React.MutableRefObject<number>
}

export const Scene: React.FC<SceneProps> = ({ audioLevelRef }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
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

      // A single triangle covering clip space.
      const positions = [-1, -1, 3, -1, -1, 3]
      const positionAttributeLocation = gl.getAttribLocation(
        program,
        'a_position',
      )
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
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
        // Wrapped to the animation cycle so shader float precision holds up
        // as the clock grows.
        gl.uniform1f(
          timeLocation,
          reducedMotion.matches ? 0 : (now / 1000) % CYCLE,
        )
        gl.uniform1f(audioLevelLocation, audioLevelRef.current)
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

// Raymarched clouds cost far more per pixel than the old 2D gradient. Render at
// device resolution but cap the pixel ratio, with a scale knob to trade
// sharpness for performance if a machine struggles.
const RENDER_SCALE = 1

const resize = (canvas: HTMLCanvasElement) => {
  const { width, height, clientWidth, clientHeight } = canvas

  const scale = Math.min(window.devicePixelRatio, 2) * RENDER_SCALE
  const displayWidth = Math.floor(clientWidth * scale)
  const displayHeight = Math.floor(clientHeight * scale)

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
