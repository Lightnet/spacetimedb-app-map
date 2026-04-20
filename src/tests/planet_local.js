import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js";
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';
const {div, button, label, input, li, ul} = van.tags;

var longitude = 0; // y
var latitude = 0;  // x
var isDrag = false;
var orbit_test;
var interactiveObjects = [];
var markerObjects = [];
var interactiveObject = null;
const MappingConfig = {
  key1:""
}
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
camera.position.z = 6;
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
    longitude =  lon;
    latitude =  lat;
    // let pos = latLonToVector3(0, 0);
    let pos = latLonToVector3(lat, lon);

    planet_ph.position.x = pos.x;
    planet_ph.position.y = pos.y;
    planet_ph.position.z = pos.z;

    let latStr = lat.toFixed(2);
    let lonStr = lon.toFixed(2);

    elabel.textContent = `Lat: ${latStr}   Lon: ${lonStr}`;
    elabel.style.display = 'block';
    elabel.style.left = `${event.clientX + 15}px`;
    elabel.style.top  = `${event.clientY + 15}px`;

    if(isDrag){
      if(interactiveObject){
        interactiveObject.position.copy(pos )
      }
    }
  } else {
    elabel.style.display = 'none';
  }
}

// ────────────────────────────────────────────────
// Resize handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ────────────────────────────────────────────────
// UPDATE
// camera.position.z = 6;

function animate() {
  requestAnimationFrame(animate);
  // gentle rotation
  // planet.rotation.y += 0.0015;
  // planet_grid.rotation.y += 0.0015;
  // planet_ph.rotation.y += 0.0015;
  if(controls){
    controls.update();
  }

  if(orbit_test){
    // orbit_test.position.x += 0.01;
    // orbit_test.position.x = 0;
    // orbit_test.position.y = 0;
    // orbit_test.position.z = 0;
    console.log(orbit_test);
    console.log(orbit_test.position);

  }

  renderer.render(scene, camera);
}

function onMouseDown(event){
  console.log('Mouse pressed at:', event.clientX, event.clientY);
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(markerObjects);
  if (intersects.length > 0) {
    console.log(intersects[0].object)
    if(isDrag == false){
      interactiveObject = intersects[0].object
      console.log("drag???")
    }
  }

  console.log(interactiveObject);
  if (interactiveObject != null){
    isDrag = true;
    controls.enableRotate = false
  }
}

function onMouseUp(event){
  console.log('Mouse released');
  if (interactiveObject != null){
    interactiveObject = null
    isDrag = false;
    controls.enableRotate = true;
  }
}

function onKeyDown(event){
  console.log('Key pressed:', event.key); 
  console.log('event.clientX:', event.clientX); 
  console.log(event.code)
  if (event.code  === 'Space') {
    console.log('space');
    let pos = latLonToVector3(latitude, longitude);
    create_marker(pos.x,pos.y,pos.z)
  }

  if (event.code  === 'KeyV') {
    console.log('test...');
    let pos = latLonToVector3(latitude, longitude);
    create_orbit(pos.x,pos.y,pos.z)
  }
}

function create_marker(x,y,z){
  const geometry_marker = new THREE.SphereGeometry(0.1, 8, 8); // smooth enough
  const material_marker = new THREE.MeshStandardMaterial({
    color: 0x000000,           // black
    roughness: 0.9,
    metalness: 0.1,
    wireframe:true
  });
  const planet_marker = new THREE.Mesh(geometry_marker, material_marker);
  planet_marker.position.x = x;
  planet_marker.position.y = y;
  planet_marker.position.z = z;
  
  scene.add(planet_marker);
  markerObjects.push(planet_marker);
}

function create_orbit(x,y,z){
  const geometry_marker = new THREE.SphereGeometry(0.1, 8, 8); // smooth enough
  const material_marker = new THREE.MeshStandardMaterial({
    color: 0x000000,           // black
    roughness: 0.9,
    metalness: 0.1,
    wireframe:true
  });
  orbit_test = new THREE.Mesh(geometry_marker, material_marker);
  orbit_test.position.x = x;
  orbit_test.position.y = y;
  orbit_test.position.z = z;
  
  scene.add(orbit_test);
  // markerObjects.push(planet_marker);
}

window.addEventListener('resize', onWindowResize);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('mousedown',onMouseDown);
window.addEventListener('mouseup',onMouseUp);
window.addEventListener('keydown', onKeyDown);

const pane = new Pane();
pane.addBinding(MappingConfig, 'key1',{disabled: true });

console.log("Planet with hover lat/lon coordinates");
animate();