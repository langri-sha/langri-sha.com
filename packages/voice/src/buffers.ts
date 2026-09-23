/** Channel data for the voice's noise source and reverb, rendered off-graph. */
export interface VoiceBuffers {
  sampleRate: number
  noise: Float32Array<ArrayBuffer>
  impulseResponse: Float32Array<ArrayBuffer>[]
}

/**
 * Serialised into a worker with `Function.prototype.toString`, so it must
 * not reference anything outside its own body.
 */
export const renderVoiceBuffers = (sampleRate: number): VoiceBuffers => {
  const noise = new Float32Array(Math.ceil(sampleRate * 3))
  for (let i = 0; i < noise.length; i++) {
    noise[i] = Math.random() * 2 - 1
  }

  /* A cavernous stereo impulse response: exponentially decaying noise that a
   * deepening one-pole lowpass darkens as it fades. */
  const length = Math.ceil(sampleRate * 5.5)
  const impulseResponse = [new Float32Array(length), new Float32Array(length)]
  for (let channel = 0; channel < impulseResponse.length; channel++) {
    const data = impulseResponse[channel]
    let smoothed = 0
    for (let i = 0; i < length; i++) {
      const brightness = 0.55 - 0.5 * (i / length)
      smoothed += (Math.random() * 2 - 1 - smoothed) * brightness
      data[i] = smoothed * Math.exp(-i / (sampleRate * 1.7))
    }
  }

  return { sampleRate, noise, impulseResponse }
}

const workerSource = `
  const render = ${renderVoiceBuffers.toString()}
  onmessage = (event) => {
    const buffers = render(event.data)
    postMessage(buffers, [
      buffers.noise.buffer,
      ...buffers.impulseResponse.map((channel) => channel.buffer),
    ])
  }
`

/**
 * Render the voice's buffers on a worker, so a caller can build the graph
 * without a long main-thread task. Falls back to the main thread where a
 * worker cannot run.
 */
export const prepareVoiceBuffers = (
  sampleRate: number,
): Promise<VoiceBuffers> =>
  new Promise((resolve) => {
    const fallback = () => resolve(renderVoiceBuffers(sampleRate))
    const url = URL.createObjectURL(
      new Blob([workerSource], { type: 'text/javascript' }),
    )

    let worker: Worker
    try {
      worker = new Worker(url)
    } catch {
      fallback()
      return
    } finally {
      URL.revokeObjectURL(url)
    }

    worker.onmessage = (event: MessageEvent<VoiceBuffers>) => {
      worker.terminate()
      resolve(event.data)
    }
    worker.onerror = () => {
      worker.terminate()
      fallback()
    }
    worker.postMessage(sampleRate)
  })
