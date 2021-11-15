import * as THREE from "three"

const createRaycaster = () => new THREE.Raycaster()

const setRaycasterFromCamera = (x, camera, raycaster) => {
  raycaster.setFromCamera(x, camera)
  return raycaster
}

const getRaycasterIntersection = (obj, raycaster) =>
  raycaster.intersectObjects(obj)

export { createRaycaster, setRaycasterFromCamera, getRaycasterIntersection }
