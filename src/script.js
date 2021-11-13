import "./style.css"
import * as THREE from "three"

import { pipe, curry } from "ramda"

import {
  createCamera,
  createScene,
  createRenderer,
  addToScene,
  setPosition,
  setRotation,
  setRendererPixelRatio,
  createOrbitControls,
  setRenderSize,
  render,
  updateControls,
  createMaterial,
  mutateUniform,
  createClock,
  getClockTime,
  createGeometry,
  addMaterial,
} from "./functions"
import { vertex } from "./shaders/vertex"
import { fragment } from "./shaders/fragment"

//_ Select the canvas
const canvas = document.querySelector("canvas.webgl")

//_ Set dimensions
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
}

//_ ------------- Functional (mostly....) --------------

//* create scene
const scene = createScene()
const addObjToScene = curry(addToScene)(scene)
scene.background = new THREE.Color("#08121C")

//* create renderer
const setRenderWindowDimensions = curry(setRenderSize)(size)
const setPixelRatioToDevice = curry(setRendererPixelRatio)(
  Math.min(window.devicePixelRatio, 2)
)

const renderer = pipe(
  createRenderer,
  setRenderWindowDimensions,
  setPixelRatioToDevice
)(canvas)

//* create points
const material = createMaterial("shader", {
  vertexShader: vertex,
  fragmentShader: fragment,
  side: THREE.DoubleSide,
  uniforms: {
    uSize: { value: 1.0 * renderer.getPixelRatio() },
    uTime: { value: 0 },
  },
})

const addShaderMaterial = curry(addMaterial)(material)

const createWireframe = (props) => {
  const wireframe = createGeometry({
    geometry: "icosahedronBuffer",
    props: props,
  })

  let length = wireframe.attributes.position.array.length

  let bary = []

  for (let i = 0; i < length; i++) {
    bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0)
  }

  const aBary = new Float32Array(bary)
  wireframe.setAttribute("aBary", new THREE.BufferAttribute(aBary, 3))

  return wireframe
}

const large = pipe(createWireframe, addShaderMaterial, addObjToScene)([5, 1])
const middle = pipe(createWireframe, addShaderMaterial, addObjToScene)([1.4, 3])
const small = pipe(createWireframe, addShaderMaterial, addObjToScene)([1, 2])

setPosition({ x: -2, y: 6, z: 3 }, small)
setPosition({ x: 1, y: -2, z: -8 }, middle)

//* create camera
const setPositionOffCenter = curry(setPosition)({ x: 0, y: 0, z: -13 })

const camera = pipe(
  createCamera,
  setPositionOffCenter,
  addObjToScene
)({
  camera: "perspective",
  props: { width: size.width, height: size.height },
})

//* create controls
const controls = createOrbitControls(canvas, camera)

//_ Resize events
window.addEventListener("resize", () => {
  //* Update sizes
  size.width = window.innerWidth
  size.height = window.innerHeight

  //* Update camera
  updateCameraAspect(camera, size.width / size.height)
  updateCameraProjectionMatrix(camera)

  //* Update renderer
  setRenderWindowDimensions(renderer)
  setPixelRatioToDevice(renderer)
})

//_ Frame function
const clock = createClock()

const frame = () => {
  updateControls(controls)
  render(scene, camera, renderer)

  const elapsedTime = getClockTime(clock)
  mutateUniform(material, "uTime", elapsedTime)

  camera.lookAt(large)

  window.requestAnimationFrame(frame)
}

frame()
