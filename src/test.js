import * as THREE from 'three';


var scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
camera.position.z = 20;
let geometry = new THREE.BoxGeometry( 1, 1, 1 );
let material = new THREE.MeshBasicMaterial({ 
  color: 0x2C5C38, 
  side: THREE.DoubleSide, 
  wireframe:true 
});
let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const parent = new THREE.Mesh(geometry, material);
parent.position.set(0, 0, 0);

// const parent = new THREE.Group();
// parent.position.set(0, 0, 0);   // your parent at origin
scene.add(parent);
geometry = new THREE.BoxGeometry( 1, 1, 1 );
material = new THREE.MeshBasicMaterial({ 
  color: 0xeb4034, // red
  side: THREE.DoubleSide, 
  wireframe:true 
});
const child = new THREE.Mesh(geometry, material);

child.position.set(0, 9, 0);    // ← this will stay (0,9,0) locally

// 1. Add/attach the child first
parent.add(child);              // or parent.attach(child)

// 2. NOW set the local position you want
// child.position.set(0, 9, 0);    // ← this will stay (0,9,0) locally

// Verify
console.log("Local position:", child.position.toArray());   // should be [0, 9, 0]
const worldPos = new THREE.Vector3();
child.getWorldPosition(worldPos);
console.log("World position:", worldPos.toArray());         // should be [0, 9, 0]


function animate() {
  requestAnimationFrame(animate);
  // console.log("date?");
  renderer.render(scene, camera);
}

animate();