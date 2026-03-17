import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
// console.log(OrbitControls);

// grid size
var grid_size = 32.0;
var pointer3d = new THREE.Vector3();
var place_grid = new THREE.Vector3();

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

// Simple light so it doesn't look flat
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 3, 4);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// OrbitControls
const controls = new OrbitControls( camera, renderer.domElement );

// ────────────────────────────────────────────────
// Raycaster + mouse
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();   // normalized device coords (-1 to +1)
const intersectionPoint = new THREE.Vector3(); // where we'll store result

// ────────────────────────────────────────────────
// const geometry = new THREE.BoxGeometry( 2, 2, 2 );
// const meshMaterial = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true } );
// const cube = new THREE.Mesh( geometry, meshMaterial );
// scene.add( cube );

const size = 1024;
const divisions = 32;
const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.set(16,-1.0,16);
scene.add( gridHelper );

// ────────────────────────────────────────────────
// PLANE
// ────────────────────────────────────────────────
// const p_geometry = new THREE.PlaneGeometry( 32, 32 );
// const p_material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide, wireframe:true } );
// const plane = new THREE.Mesh( p_geometry, p_material );
// plane.rotateX(degrees_to_radians(90));
// scene.add( plane );


const ph_geometry = new THREE.PlaneGeometry( 32, 32 );
const ph_material = new THREE.MeshBasicMaterial({ 
  color: 0x2C5C38, 
  side: THREE.DoubleSide, 
  wireframe:true 
});
const pg_plane = new THREE.Mesh( ph_geometry, ph_material );
pg_plane.rotateX(degrees_to_radians(90));
scene.add( pg_plane );

function create_grid(){
  const p_geometry = new THREE.PlaneGeometry( 32, 32 );
  const p_material = new THREE.MeshBasicMaterial( {
    color: 0xffff00, 
    side: THREE.DoubleSide, 
    wireframe:true 
  });
  const plane = new THREE.Mesh( p_geometry, p_material );
  plane.rotateX(degrees_to_radians(90));
  plane.userData.type='tile'
  scene.add( plane );
  return plane;
}

// ────────────────────────────────────────────────
// Define a function named degrees_to_radians that converts degrees to radians.
function degrees_to_radians(degrees){
  // Store the value of pi.
  var pi = Math.PI;
  // Multiply degrees by pi divided by 180 to convert to radians.
  return degrees * (pi/180);
}
// ────────────────────────────────────────────────

// const loader = new SVGLoader();
// const data = await loader.loadAsync( 
//   'whitebox32.svg'
//   // 'point_triangle01.svg' 
// );
// const paths = data.paths;
// const group = new THREE.Group();
// for ( let i = 0; i < paths.length; i ++ ) {
// 	const path = paths[ i ];
// 	const material = new THREE.MeshBasicMaterial( {
// 		color: path.color,
// 		side: THREE.DoubleSide,
// 		depthWrite: false
// 	} );
// 	const shapes = SVGLoader.createShapes( path );
// 	for ( let j = 0; j < shapes.length; j ++ ) {
// 		const shape = shapes[ j ];
// 		const geometry = new THREE.ShapeGeometry( shape );
// 		const mesh = new THREE.Mesh( geometry, material );
// 		group.add( mesh );
// 	}
// }

// group.rotateX(degrees_to_radians(90));//pass
// group.rotateY(degrees_to_radians(90));
// group.rotateZ(degrees_to_radians(90));
// scene.add( group );

// let test01 = group.clone();
// test01.position.x = 38;
// scene.add( test01 );

// We'll visualize the hit point with a small sphere
const marker = new THREE.Mesh(
  new THREE.BoxGeometry(2,2,2),
  new THREE.MeshBasicMaterial({
    color: 0xff3366,
    wireframe:true
  })
);
marker.visible = false;
scene.add(marker);

// ────────────────────────────────────────────────
// Animation + rotation
// camera.position.z = 6;
camera.position.z = 64;
camera.position.y = 64;

function update_position_placeholder_tile(){
  if(pointer3d){
    // console.log(pointer3d)
    let grid_x  = Math.round(pointer3d.x / grid_size) * grid_size;
    let grid_y = Math.round(pointer3d.y / grid_size) * grid_size;
    let grid_z  = Math.round(pointer3d.z / grid_size) * grid_size;

    // console.log("g x:", grid_x, " y:", grid_y, " z:",grid_z);

    place_grid.set(grid_x, grid_y, grid_z);

    if(pg_plane){
      pg_plane.position.x = grid_x;
      // pg_plane.position.y = grid_z;
      pg_plane.position.z = grid_z;
    }
  }
}

// ─── Mouse move handler ────────────────────────────────────────
function onPointerMove(event) {
  // update normalized mouse position
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Instead of intersecting a mesh:
  raycaster.setFromCamera(pointer, camera);

  // direction is already normalized
  const direction = raycaster.ray.direction;
  const origin    = raycaster.ray.origin;

  // Solve: origin + t * direction = point on plane y = 0
  const t = -origin.y / direction.y;



  if (t > 0.001) {   // avoid division by zero + behind camera
    intersectionPoint.copy(origin).addScaledVector(direction, t);
    pointer3d.copy(intersectionPoint);
    update_position_placeholder_tile()
    marker.position.copy(intersectionPoint);
    marker.visible = true;

    // ─── Here is your desired Vector3 ────────────────────────
    // console.log("Ground position:", intersectionPoint.x.toFixed(2),
    //                                   intersectionPoint.y.toFixed(2),
    //                                   intersectionPoint.z.toFixed(2));
  } else {
    marker.visible = false;
  }

}

function animate() {
  requestAnimationFrame(animate);
  // gentle rotation
  // planet.rotation.y += 0.0015;
  if(controls){
    controls.update();
  }
  renderer.render(scene, camera);
}

// ────────────────────────────────────────────────
// Resize handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


function place_grid_tile(){

  // make sure they do not overlap
  let isFound = false;

  let grid_x  = Math.round(place_grid.x / grid_size) * grid_size;
  let grid_y = Math.round(place_grid.y / grid_size) * grid_size;
  let grid_z  = Math.round(place_grid.z / grid_size) * grid_size;
  for (const objModel of scene.children) {
    // Access child properties
    let grid_x2  = Math.round(objModel.position.x / grid_size) * grid_size;
    let grid_y2 = Math.round(objModel.position.y / grid_size) * grid_size;
    let grid_z2  = Math.round(objModel.position.z / grid_size) * grid_size;
    if((grid_x == grid_x2)&&(grid_y == grid_y2)&&(grid_z == grid_z2)){
      if(objModel?.userData?.type=='tile'){
        isFound=true;
        console.log("FOUND SAME POSITION");
        console.log("1 x:", grid_x," y:", grid_x," z:", grid_x,);
        console.log("2 x:", grid_x2," y:", grid_x2," z:", grid_x2);
        console.log(objModel.position);
      }
      
    }
  }
  if(isFound == false){
    if(place_grid){
    let p = create_grid();
    p.position.set(place_grid.x,place_grid.y,place_grid.z);
  }
  }
}

function delete_grid_tile(){

  // make sure they do not overlap
  let isFound = false;

  let grid_x  = Math.round(place_grid.x / grid_size) * grid_size;
  let grid_y = Math.round(place_grid.y / grid_size) * grid_size;
  let grid_z  = Math.round(place_grid.z / grid_size) * grid_size;
  for (const objModel of scene.children) {
    // Access child properties
    let grid_x2  = Math.round(objModel.position.x / grid_size) * grid_size;
    let grid_y2 = Math.round(objModel.position.y / grid_size) * grid_size;
    let grid_z2  = Math.round(objModel.position.z / grid_size) * grid_size;
    if((grid_x == grid_x2)&&(grid_y == grid_y2)&&(grid_z == grid_z2)){
      if(objModel?.userData?.type=='tile'){
        isFound=true;
        console.log("FOUND SAME POSITION");
        console.log("1 x:", grid_x," y:", grid_x," z:", grid_x,);
        console.log("2 x:", grid_x2," y:", grid_x2," z:", grid_x2);
        console.log(objModel.position);
        scene.remove(objModel);
      }
    }
  }
}

// ────────────────────────────────────────────────
// Events
window.addEventListener('resize', onWindowResize);
window.addEventListener('pointermove', onPointerMove);
animate();


window.addEventListener('keydown', (event)=>{
  console.log(event.code);


  if(event.code == 'KeyB'){
    place_grid_tile();
  }

  if(event.code == 'KeyX'){
    delete_grid_tile();
  }
});

// https://lil-gui.georgealways.com/
const gui = new GUI();
const mapping_config = {
  myBoolean: true,
  key1:"B = Build",
  key2:"X = Delete",
}
gui.add( mapping_config, 'myBoolean' );  // Checkbox

const hkfolder = gui.addFolder( 'Hot Keys' );
hkfolder.add(mapping_config,'key1').disable();
hkfolder.add(mapping_config,'key2').disable();


console.log("Planet with hover lat/lon coordinates");

