'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import fragmentShaderSource from './default.frag'
import vertexShaderSource from './default.vert'
import { type SceneCanvas, start } from './start'

const id = 'scene'

export interface SceneProps {
  audioLevelRef?: React.MutableRefObject<number>
}

export const Scene: React.FC<SceneProps> = ({ audioLevelRef }) => {
  const canvasRef = React.useRef<SceneCanvas | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // `SceneScript` doesn't run when the page renders on the client.
    const scene =
      canvas.__scene ?? start(canvas, vertexShaderSource, fragmentShaderSource)
    if (!scene) return

    scene.audioLevelRef = audioLevelRef

    return () => scene.dispose()
  }, [audioLevelRef])

  // `SceneScript` sizes the canvas before hydration.
  return <Canvas id={id} ref={canvasRef} suppressHydrationWarning />
}

/*
 * Starts the scene while the document is still parsing, ahead of hydration.
 * Its body comes from the server and client compilations of `start`, which
 * can differ, so hydration leaves it alone.
 */
export const SceneScript: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{ __html: bootstrap }}
    suppressHydrationWarning
  />
)

const bootstrap = `(${start.toString()})(document.getElementById(${JSON.stringify(id)}),${JSON.stringify(vertexShaderSource)},${JSON.stringify(fragmentShaderSource)})`

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
`
