import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js";
import { ViewportGizmo } from "three-viewport-gizmo";


let scene, camera, renderer, orbitControl, gizmo;
let planet;

function setupThree(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000022); // dark space feel
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 6;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  orbitControl = new OrbitControls( camera, renderer.domElement );
  renderer.setAnimationLoop(animate);
  setup_lights();
  setupScene();
  setup_camera_controllers();

  window.addEventListener('resize', onWindowResize);
}

function setup_lights(){
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(5, 3, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));
}

function setup_camera_controllers(){
  orbitControl = new OrbitControls( camera, renderer.domElement );
  gizmo = new ViewportGizmo(camera, renderer,{
    placement: "bottom-right",
  });
  gizmo.attachControls(orbitControl);
}

function setupHelpers(){

}

function setup_planet(){
  // ────────────────────────────────────────────────
  // Planet (sphere)
  const radius = 2;
  const geometry = new THREE.SphereGeometry(radius, 64, 48); // smooth enough
  const material = new THREE.MeshStandardMaterial({
    color: 0x2266ff,           // ocean-ish
    roughness: 0.9,
    metalness: 0.1,
  });
  planet = new THREE.Mesh(geometry, material);
  scene.add(planet);

  const geometry_grid = new THREE.SphereGeometry(2.02, 36, 18); // smooth enough
  const material_grid = new THREE.MeshStandardMaterial({
    color: 0x000000,           // black
    roughness: 0.9,
    metalness: 0.1,
    wireframe:true
  });
  const planet_grid = new THREE.Mesh(geometry_grid, material_grid);
  scene.add(planet_grid);


  const geometry_ph = new THREE.SphereGeometry(0.1, 4, 4); // smooth enough
  const material_ph = new THREE.MeshStandardMaterial({
    // color: 0x000000,        // black
    color: 0x6EFF93,           //
    roughness: 0.9,
    metalness: 0.1,
    wireframe:true
  });
  const planet_ph = new THREE.Mesh(geometry_ph, material_ph);
  scene.add(planet_ph);
}

function setupScene(){
  setup_planet();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gizmo.update();
}

function animate() {
  renderer.render(scene, camera);
  gizmo.render();
}


// ────────────────────────────────────────────────
// Raycaster + mouse
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();   // normalized device coords (-1 to +1)


function vector3ToLatLon(v, radius = 2) {
  v = v.clone().normalize(); // just in case

  const lat = 90 - Math.acos(v.y) * 180 / Math.PI;
  let   lon = Math.atan2(v.x, v.z) * 180 / Math.PI;

  // Make longitude -180 … +180
  if (lon < -180) lon += 360;
  if (lon >  180) lon -= 360;

  return { lat, lon };
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(planet);

  if (intersects.length > 0) {
    const point = intersects[0].point.clone(); // world space
    // console.log(point);

    const { lat, lon } = vector3ToLatLon(point, 2);
    console.log("lat:", lat);
    // console.log("lon:", lon);


  }

}

function onMouseDown(event){

}

function onMouseUp(event){

}

function onKeyDown(event){

}

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('mousedown',onMouseDown);
window.addEventListener('mouseup',onMouseUp);
window.addEventListener('keydown', onKeyDown);




export function setupPlanet(){
  setupThree();
}