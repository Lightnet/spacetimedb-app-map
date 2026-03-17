import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js";

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';
const {div, button, label, input, li, ul} = van.tags;

// ────────────────────────────────────────────────
// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022); // dark space feel
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );

// ────────────────────────────────────────────────
// Planet (sphere)
const radius = 2;
const geometry = new THREE.SphereGeometry(radius, 64, 48); // smooth enough
const material = new THREE.MeshStandardMaterial({
  color: 0x2266ff,           // ocean-ish
  roughness: 0.9,
  metalness: 0.1,
});
const planet = new THREE.Mesh(geometry, material);
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

const geometry_ph = new THREE.SphereGeometry(0.5, 8, 8); // smooth enough
const material_ph = new THREE.MeshStandardMaterial({
  color: 0x000000,           // black
  roughness: 0.9,
  metalness: 0.1,
  wireframe:true
});
const planet_ph = new THREE.Mesh(geometry_ph, material_ph);
scene.add(planet_ph);

// Simple light so it doesn't look flat
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 3, 4);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// ────────────────────────────────────────────────
// Raycaster + mouse
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();   // normalized device coords (-1 to +1)

// HTML label for showing lat/lon
const elabel = document.createElement('div');
elabel.style.position = 'absolute';
elabel.style.background = 'rgba(0,0,0,0.6)';
elabel.style.color = 'white';
elabel.style.padding = '6px 10px';
elabel.style.borderRadius = '5px';
elabel.style.pointerEvents = 'none';
elabel.style.fontFamily = 'Arial, sans-serif';
elabel.style.fontSize = '13px';
elabel.style.display = 'none';
document.body.appendChild(elabel);

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
// ────────────────────────────────────────────────
// Mouse move → raycast → show lat/lon
function onPointerMove(event) {
  // update normalized pointer position
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(planet);

  if (intersects.length > 0) {
    const point = intersects[0].point.clone(); // world space
    const { lat, lon } = vector3ToLatLon(point, 2);
    // let pos = latLonToVector3(0, 0);
    let pos = latLonToVector3(lat, lon);

    planet_ph.position.x = pos.x;
    planet_ph.position.y = pos.y;
    planet_ph.position.z = pos.z;

    // console.log("ph pos x:",pos.x, " y:", pos.y ," z:",pos.z);

    // Optional: nicer formatting
    // const latStr = lat.toFixed(2) + '° ' + (lat >= 0 ? 'N' : 'S');
    // const lonStr = Math.abs(lon).toFixed(2) + '° ' + (lon >= 0 ? 'E' : 'W');

    let latStr = lat.toFixed(2);
    let lonStr = lon.toFixed(2);

    // if(isDrag){
    //   let la = lat.toFixed(2);
    //   let lo = Math.abs(lon).toFixed(2);
    //   let pos = latLonToCartesian(lon,la);
    //   console.log(pos);
    //   interactiveObject.position.x = pos.x;
    //   interactiveObject.position.y = pos.y;
    //   interactiveObject.position.z = pos.z;

    // }

    elabel.textContent = `Lat: ${latStr}   Lon: ${lonStr}`;
    elabel.style.display = 'block';
    elabel.style.left = `${event.clientX + 15}px`;
    elabel.style.top  = `${event.clientY + 15}px`;
  } else {
    elabel.style.display = 'none';
  }

  raycast_check_marker();
}

// ────────────────────────────────────────────────
// Resize handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ────────────────────────────────────────────────
// Animation + rotation
camera.position.z = 6;

function animate() {
  requestAnimationFrame(animate);

  // gentle rotation
  planet.rotation.y += 0.0015;

  if(controls){
    controls.update();
  }

  renderer.render(scene, camera);
}


window.addEventListener('resize', onWindowResize);
window.addEventListener('pointermove', onPointerMove);
animate();

console.log("Planet with hover lat/lon coordinates");