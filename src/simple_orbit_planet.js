// test.js
// not fully working yet.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewportGizmo } from "three-viewport-gizmo";
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js";

const {div, style} = van.tags;

van.add(document.body, style(`
.tp-dfwv {
  width: 400px; /* Adjust the total width */
}
.tp-lblv_v {
  width: 240px; /* Adjust the label column width */
}    
`))


// X = Longitude (East-West)
// Y = Latitude (North-South)
function latLonToVector3(latitude, longitude, radius = 2) {
  const phi   = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
}
function vector3ToLatLon(v, radius = 2) {
  v = v.clone().normalize(); // just in case
  const lat = 90 - Math.acos(v.y) * 180 / Math.PI;
  let   lon = Math.atan2(v.x, v.z) * 180 / Math.PI;
  // Make longitude -180 … +180
  if (lon < -180) lon += 360;
  if (lon >  180) lon -= 360;
  return { lat, lon };
}
const PARAMS = {
  position:{x:0,y:0,z:0},
  orbitSpeed:0.1,
  longitude:0.1,
  latitude:0.1,
  enable:false, //orbit
  planetRadius:1,
  orbitRadius:2,

  inclination: 45,                    // degrees: 0 = equatorial, 90 = polar
  longitudeOfAscendingNode: 0,        // degrees: rotates the orbit plane (direction)

}
// ─── Scene Setup ───────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88aaff);
const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 1000
);
// camera.position.set(8, 10, 12);
camera.position.set(8, 0, 0);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls( camera, renderer.domElement );
const gizmo = new ViewportGizmo(camera, renderer,{
  placement: "bottom-right",
});
gizmo.attachControls(controls);
const gridHelper = new THREE.GridHelper(10,10)
scene.add( gridHelper );
// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(10, 18, 8);
scene.add(dirLight);
// Create planet
const planetGeo = new THREE.SphereGeometry(1.8, 16, 16);
const planetMat = new THREE.MeshBasicMaterial({
  color: 0x00000f,
  wireframe:true
});
const planet = new THREE.Mesh(planetGeo, planetMat);
scene.add(planet);
// Create satellite
const satGeo = new THREE.SphereGeometry(0.15, 8, 8);
const satMat = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe:true
});
const satellite = new THREE.Mesh(satGeo, satMat);
scene.add(satellite);
// Starting vector from your marker
const startPosition = latLonToVector3(PARAMS.latitude, PARAMS.longitude, PARAMS.orbitRadius);
satellite.position.copy(startPosition);
const timer = new THREE.Timer();
// ─── update loop ────────────────────────────────────────────
// function animate() {
//   timer.update()
//   const delta = timer.getDelta();
//   requestAnimationFrame(animate);
//   renderer.render(scene, camera);
//   gizmo.render();
// }

// ─── Event listeners ───────────────────────────────────────────
// window.addEventListener('pointermove', onPointerMove);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gizmo.update();
});
// Optional: click to place something (example)
window.addEventListener('click',()=>{

});
const pane = new Pane({width:300});
pane.addBinding(PARAMS, 'enable', { label: 'Orbit Enabled' });
pane.addBinding(PARAMS, 'orbitSpeed', { 
  label: 'Orbit Speed', 
  min: 0.01, 
  max: 2.0, 
  step: 0.01 
});
// pane.addBinding(PARAMS, 'orbitRadius', { min: 0.5, max: 5, step: 0.1 });
// pane.addBinding(PARAMS, 'planetRadius', { min: 0.5, max: 3 });

pane.addBinding(PARAMS, 'inclination', { 
  label: 'Inclination (°)', min: 0, max: 180, step: 1 
}).on('change', resetOrbit);

pane.addBinding(PARAMS, 'longitudeOfAscendingNode', { 
  label: 'Ascending Node (°)', min: -180, max: 180, step: 1 
}).on('change', resetOrbit);

pane.addBinding(PARAMS, 'longitude', { 
  label: 'Start Longitude (°)', 
  min: -180, 
  max: 180 
}).on('change', updateSatellitePosition);
pane.addBinding(PARAMS, 'latitude', { 
  label: 'Start Latitude (°)', 
  min: -90, 
  max: 90 
}).on('change', updateSatellitePosition);
// Helper function
function updateSatellitePosition() {
  const pos = latLonToVector3(PARAMS.latitude, PARAMS.longitude, PARAMS.orbitRadius);
  satellite.position.copy(pos);
  orbitAngle = THREE.MathUtils.degToRad(PARAMS.longitude); // sync angle with starting longitude
}

// pane.addBinding(PARAMS,'position').on('change',()=>{
//   console.log("change...");
//   cone.position.set(PARAMS.position0.x, PARAMS.position0.y, PARAMS.position0.z )
//   console.log(cone.scale);
// })
// pane.addButton({title:'up'}).on('click',()=>{
//   console.log('click...');
// })

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

// Add these after creating satellite and PARAMS
let orbitAngle = 0;                    // current angle in radians
const orbitSpeed = 0.5;                // radians per second (adjust for faster/slower orbit)
const orbitAxis = new THREE.Vector3(0, 1, 0); // Y-axis = equatorial orbit (change this for inclined orbits)

function animate() {
  timer.update();
  const delta = timer.getDelta();   // time since last frame
  // === ORBIT MATH HERE ===
  if (PARAMS.enable) {
    orbitAngle += PARAMS.orbitSpeed * delta;

    const position = getOrbitalPosition(orbitAngle);
    satellite.position.copy(position);

  }
  // Optional: make satellite always face the direction it's moving (nice visual)
  // satellite.lookAt(0, 0, 0);   // faces planet center (radial)
  // or face tangent direction if you want "forward" motion
  renderer.render(scene, camera);
  gizmo.render();
  requestAnimationFrame(animate);
}

function resetOrbit() {
  orbitAngle = 0;
  updateSatelliteToCurrentParams();
}

function updateSatelliteToCurrentParams() {
  const pos = getOrbitalPosition(0); // get position at angle = 0
  satellite.position.copy(pos);
}

// Main orbital position calculator (pure math)
function getOrbitalPosition(angle) {
  const radius = PARAMS.orbitRadius;
  const inc = THREE.MathUtils.degToRad(PARAMS.inclination);
  const omega = THREE.MathUtils.degToRad(PARAMS.longitudeOfAscendingNode); // Ω

  // 1. Position in orbital plane (inclination = 0)
  const x_orb = radius * Math.cos(angle);
  const y_orb = 0;
  const z_orb = radius * Math.sin(angle);

  // 2. Apply inclination (rotate around x-axis)
  const x_inc = x_orb;
  const y_inc = y_orb * Math.cos(inc) - z_orb * Math.sin(inc);
  const z_inc = y_orb * Math.sin(inc) + z_orb * Math.cos(inc);

  // 3. Rotate by Longitude of Ascending Node (rotate around z-axis)
  const x = x_inc * Math.cos(omega) - y_inc * Math.sin(omega);
  const y = x_inc * Math.sin(omega) + y_inc * Math.cos(omega);
  const z = z_inc;

  return new THREE.Vector3(x, y, z);
}




animate();