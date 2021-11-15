import "./style.css"
import * as THREE from "three"

import { pipe, curry, median } from "ramda"

import {
  createCamera,
  createScene,
  createRenderer,
  addToScene,
  setPosition,
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
  setRotation,
  createRaycaster,
  setRaycasterFromCamera,
  getRaycasterIntersection,
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

//* create geometry
const material = createMaterial("shader", {
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  uniforms: {
    uSize: { value: 1.0 * renderer.getPixelRatio() },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.0, 1.0) },
  },
})

const addShaderMaterial = curry(addMaterial)(material)

const geometry = pipe(
  createGeometry,
  addShaderMaterial,
  addObjToScene
)({ geometry: "plane", props: [20, 10, 1, 1] })

//* create camera
const setPositionOffCenter = curry(setPosition)({ x: 0, y: 0, z: 2 })

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

//_ raycaster
const raycaster = createRaycaster()

const mouse = new THREE.Vector2()

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
}

window.addEventListener("mousemove", onMouseMove, false)

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

  setRaycasterFromCamera(mouse, camera, raycaster)

  const intersects = getRaycasterIntersection(scene.children, raycaster)
  const uv = intersects.length ? intersects[0].uv : new THREE.Vector2(0.0, 1.0)

  mutateUniform(material, "uMouse", uv)

  const elapsedTime = getClockTime(clock)
  mutateUniform(material, "uTime", elapsedTime)

  render(scene, camera, renderer)

  window.requestAnimationFrame(frame)
}

frame()
