import Component from 'inferno-component'

import styles from './styles'

const vertexShaderSource = `
  // an attribute will receive data from a buffer
  attribute vec4 a_position;

  // all shaders have a main function
  void main() {

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
  }
`

const fragmentShaderSource = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;

  void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
  }
`

export default class Scene extends Component {
  componentDidMount () {
    const gl = this.gl = this.canvas.getContext('webgl')
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = createProgram(gl, vertexShader, fragmentShader)

    const positions = [
      0, 0,
      0, 0.5,
      0.7, 0
    ]
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    resize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)

    gl.enableVertexAttribArray(positionAttributeLocation)
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const size = 2          // 2 components per iteration
    const type = gl.FLOAT   // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
    gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize,
      stride, 0
    )

    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 3
    gl.drawArrays(primitiveType, offset, count)
  }

  render () {
    return <canvas className={styles.scene} ref={(canvas) => { this.canvas = canvas }} />
  }
}

function createShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

function createProgram (gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
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

function resize (canvas) {
  const {width, height, clientWidth, clientHeight} = canvas

  const displayWidth = Math.floor(clientWidth * window.devicePixelRatio)
  const displayHeight = Math.floor(clientHeight * window.devicePixelRatio)

  if (width !== displayWidth || height !== displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}
