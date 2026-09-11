'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import fragmentShaderSource from './default.frag'
import vertexShaderSource from './default.vert'
import { FULLSCREEN_TRIANGLE, createProgram, createShader, resize } from './gl'
import starSource from './star.glsl'

// The wind scroll and camera yaw are wrapped to this period so shader float
// precision holds up as the clock grows. Matches CYCLE_SECONDS in the shader.
const CYCLE = 256

export interface SceneProps {
  audioLevelRef?: React.MutableRefObject<number>
  /** Render the rift as the bare star, without its top and bottom tails. */
  starOnly?: boolean
}

export const Scene: React.FC<SceneProps> = ({ audioLevelRef, starOnly }) => {
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
        (starOnly ? '#define RIFT_STAR_ONLY 1\n' : '') +
          starSource +
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
        // Wrapped to the animation cycle so shader float precision holds up
        // as the clock grows.
        gl.uniform1f(
          timeLocation,
          reducedMotion.matches ? 0 : (now / 1000) % CYCLE,
        )
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
  }, [audioLevelRef, starOnly])

  return <Canvas ref={canvasRef} />
}

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
`
