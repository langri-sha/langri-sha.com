import * as THREE from 'three'
import React, {Component} from 'react'

import styles from './styles'

export default class Scene extends Component {
  componentDidMount () {
    const {innerWidth, innerHeight, devicePixelRatio} = window

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000)
    camera.position.y = -100
    camera.position.z = 150

    const grid = new THREE.GridHelper(750, 2 ** 5, 0xAABBCC, 0xAA01AA)
    grid.position.y = -125
    scene.add(grid)

    const renderer = this.renderer = new THREE.WebGLRenderer({alpha: true})
    renderer.setPixelRatio(devicePixelRatio)
    renderer.setSize(innerWidth, innerHeight)
    this.container.appendChild(renderer.domElement)

    Object.assign(this, {scene, camera, renderer})
    window.addEventListener('resize', ::this.windowDidResize, false)

    this.draw(scene, camera, renderer)
  }

  windowDidResize () {
    const {innerWidth, innerHeight} = window
    const {camera, renderer} = this

    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
  }

  componetWillUnmount () {
    window.removeEventListener('resize', ::this.windowDidResize)
  }

  draw (scene, camera, renderer) {
    window.requestAnimationFrame(() => { this.draw(scene, camera, renderer) })
    this.renderer.render(scene, camera)
  }

  render () {
    return <div className={styles.scene} ref={(container) => { this.container = container }} />
  }
}
