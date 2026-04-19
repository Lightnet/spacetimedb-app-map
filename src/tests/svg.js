import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';


// console.log(OrbitControls);
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_svg.html
// 

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
// scene.add(planet);

const geometry_grid = new THREE.SphereGeometry(2.02, 36, 18); // smooth enough
const material_grid = new THREE.MeshStandardMaterial({
  color: 0x000000,           // black
  roughness: 0.9,
  metalness: 0.1,
  wireframe:true
});
const planet_grid = new THREE.Mesh(geometry_grid, material_grid);
// scene.add(planet_grid);

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
const label = document.createElement('div');
label.style.position = 'absolute';
label.style.background = 'rgba(0,0,0,0.6)';
label.style.color = 'white';
label.style.padding = '6px 10px';
label.style.borderRadius = '5px';
label.style.pointerEvents = 'none';
label.style.fontFamily = 'Arial, sans-serif';
label.style.fontSize = '13px';
label.style.display = 'none';
document.body.appendChild(label);

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

    // Convert cartesian → spherical coordinates
    const spherical = new THREE.Spherical().setFromCartesianCoords(
      point.x, point.y, point.z
    );

    // latitude:  90° – polar angle in degrees
    // longitude: azimuthal angle (adjusted to -180°…+180°)
    let lat = 90 - THREE.MathUtils.radToDeg(spherical.phi);
    let lon = THREE.MathUtils.radToDeg(spherical.theta) - 180;

    // Optional: nicer formatting
    const latStr = lat.toFixed(2) + '° ' + (lat >= 0 ? 'N' : 'S');
    const lonStr = Math.abs(lon).toFixed(2) + '° ' + (lon >= 0 ? 'E' : 'W');

    label.textContent = `Lat: ${latStr}   Lon: ${lonStr}`;
    label.style.display = 'block';
    label.style.left = `${event.clientX + 15}px`;
    label.style.top  = `${event.clientY + 15}px`;
  } else {
    label.style.display = 'none';
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
// Animation + rotation
camera.position.z = 6;


const geometry_box = new THREE.BoxGeometry( 1, 1, 1 );
const material_box = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry_box, material_box );
scene.add( cube );


const loader = new SVGLoader();
const svgData = await loader.loadAsync('point_triangle01.svg');

const group = new THREE.Group();

svgData.paths.forEach(path => {
  const shapes = SVGLoader.createShapes(path);
  shapes.forEach(shape => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
    //   depth: 1,          // ← the "3D" part
      bevelEnabled: false,
    //   bevelThickness: 1,
    //   bevelSize: 1,
    //   bevelSegments: 1
    });

    const material = new THREE.MeshStandardMaterial({
      color: path.color || 0xff8800,
      metalness: 0.3,
      roughness: 0.4
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
  });
});

scene.add(group);











function animate() {
  requestAnimationFrame(animate);

  // gentle rotation
  planet.rotation.y += 0.0015;

  if(controls){
    controls.update();
  }

  renderer.render(scene, camera);
}

// ────────────────────────────────────────────────
// Events
window.addEventListener('resize', onWindowResize);
window.addEventListener('pointermove', onPointerMove);

animate();

console.log("Planet with hover lat/lon coordinates");