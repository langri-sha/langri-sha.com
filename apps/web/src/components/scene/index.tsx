'use client'

import styled from '@emotion/styled'
import * as React from 'react'

import fragmentShaderSource from './default.frag'
import vertexShaderSource from './default.vert'
import { start } from './start'

export interface SceneProps {
  audioLevelRef?: React.MutableRefObject<number>
}

export const Scene: React.FC<SceneProps> = ({ audioLevelRef }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = start(canvas, vertexShaderSource, fragmentShaderSource)
    if (!scene) return

    scene.audioLevelRef = audioLevelRef

    return () => scene.dispose()
  }, [audioLevelRef])

  return <Canvas ref={canvasRef} />
}

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
`
