import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "vanjs-core";
import { ViewportGizmo } from "three-viewport-gizmo";
import { degrees_to_radians } from './helper';
import { PARAMS, stateBuildSelect, stateConn, stateGrid3DPosition, stateGridSize, stateIntersectionPoint, stateIsDrag, stateMarker, stateMarkers, stateOrbitControl, statePHPlane, statePointer2D, statePointer3D, stateRaycaster, stateScene, stateSelectEntityId } from './context';

//-----------------------------------------------
// THRREE JS
//-----------------------------------------------
var axesHelper = null;
var scene;
var camera;
var renderer;
var controls;
var gizmo;

function setup_renderer(){
  axesHelper = new THREE.AxesHelper( 5 );
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000022); // dark space feel
  scene.add(axesHelper);
  stateScene.val = scene
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // camera.position.z = 6;
  camera.position.z = 64;
  camera.position.y = 64;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
}
// ────────────────────────────────────────────────
// LIGHTS
// ────────────────────────────────────────────────
// Simple light so it doesn't look flat
function setup_lights(){
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(5, 3, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));
}
// ────────────────────────────────────────────────
// OrbitControls
// ────────────────────────────────────────────────
function setup_camera_controllers(){
  controls = new OrbitControls( camera, renderer.domElement );
  stateOrbitControl.val = controls;
  gizmo = new ViewportGizmo(camera, renderer,{
    placement: "bottom-right",
  });
  gizmo.attachControls(controls);
}
// ────────────────────────────────────────────────
function create_grid_helper(){
  const size = 1024;
  const divisions = 32;
  const gridHelper = new THREE.GridHelper( size, divisions );
  gridHelper.position.set(16,-1.0,16);
  return gridHelper
}
//-----------------------------------------------
// Pointer Geometry
//-----------------------------------------------
export function create_model_marker(){
  const t_geometry = new THREE.ConeGeometry( 4, 8, 4 );
  const t_material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe:true
  });
  const _marker = new THREE.Mesh( t_geometry, t_material );
  _marker.rotation.x = Math.PI;
  _marker.userData.tag='Marker';
  return _marker;
}
// ────────────────────────────────────────────────
// PLANE
// ────────────────────────────────────────────────
function create_plane_floor(){
  const geometry = new THREE.PlaneGeometry( 32, 32 );
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x2C5C38, 
    side: THREE.DoubleSide, 
    wireframe:true 
  });
  const plane = new THREE.Mesh( geometry, material );
  plane.rotateX(degrees_to_radians(90));
  return plane;
}
//-----------------------------------------------
// CREATE GRID
//-----------------------------------------------
export function create_tile(){
  const p_geometry = new THREE.PlaneGeometry( 32, 32 );
  const p_material = new THREE.MeshBasicMaterial( {
    color: 0xffff00, 
    side: THREE.DoubleSide, 
    wireframe:true 
  });
  const plane = new THREE.Mesh( p_geometry, p_material );
  plane.rotateX(degrees_to_radians(90));
  plane.userData.type='tile'
  return plane;
}
//-----------------------------------------------
// CREATE CUBE MARKER
//-----------------------------------------------
function cube_marker(){
  const geometry = new THREE.BoxGeometry(2,2,2);
  // const wireframe = new THREE.WireframeGeometry( geometry );
  const wireframe = new THREE.EdgesGeometry( geometry );
  const lineMaterial = new THREE.LineBasicMaterial({
    // color: 0xffffff
    color: 0xff0000
  });
  const line = new THREE.LineSegments( wireframe, lineMaterial  );
  line.material.depthWrite = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;
  return line
}
// ────────────────────────────────────────────────
// THREE UPDATE
// ────────────────────────────────────────────────
function animate() {
  // requestAnimationFrame(animate);
  // gentle rotation
  // planet.rotation.y += 0.0015;
  if(controls){
    controls.update();
  }
  renderer.render(scene, camera);
  gizmo.render();
}
// ────────────────────────────────────────────────
// Resize handler
//-----------------------------------------------
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gizmo.update();
}
// ────────────────────────────────────────────────
// SET UP SCENE
// ────────────────────────────────────────────────
function setup_scene(){
  setup_lights();
  scene.add( create_grid_helper() );
  const ph_plane = create_plane_floor();
  statePHPlane.val = ph_plane;
  scene.add( ph_plane );
  const marker = cube_marker();
  stateMarker.val = marker;
  scene.add(marker);
  setup_camera_controllers()
  setupListens();
}

function update_pointer3d_plane(){
  if(statePointer3D.val){
    // console.log(statePointer3D.val);
    const pointer3d = statePointer3D.val;

    let grid_x  = Math.round(pointer3d.x / stateGridSize.val) * stateGridSize.val;
    let grid_y = Math.round(pointer3d.y / stateGridSize.val) * stateGridSize.val;
    let grid_z  = Math.round(pointer3d.z / stateGridSize.val) * stateGridSize.val;

    stateGrid3DPosition.val.x = grid_x;
    stateGrid3DPosition.val.y = grid_y;
    stateGrid3DPosition.val.z = grid_z;

    // console.log("stateGrid3DPosition.val");
    // console.log(stateGrid3DPosition.val);

    if(statePHPlane.val){
      const phPlane = statePHPlane.val;
      // mesh set position
      phPlane.position.set(
        grid_x,
        grid_y,
        grid_z
      );
    }
  }
}

function onPointer3DPlaneMove(event){
  if(statePointer2D.val){
    statePointer2D.val.x =(event.clientX / window.innerWidth) * 2 - 1;
    statePointer2D.val.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // console.log(statePointer2D.val);

    const raycaster = stateRaycaster.val;

    // Instead of intersecting a mesh:
    raycaster.setFromCamera(statePointer2D.val, camera);

    // direction is already normalized
    const direction = raycaster.ray.direction;
    const origin    = raycaster.ray.origin;

    // Solve: origin + t * direction = point on plane y = 0
    const t = -origin.y / direction.y;

    if (t > 0.001) {   // avoid division by zero + behind camera
      const intersectionPoint = stateIntersectionPoint.val;
      intersectionPoint.copy(origin).addScaledVector(direction, t);
      // PARAMS.pointer3d.x = intersectionPoint.x;
      // PARAMS.pointer3d.y = intersectionPoint.y;
      // PARAMS.pointer3d.z = intersectionPoint.z;
      
      const pointer3d = statePointer3D.val;
      pointer3d.copy(intersectionPoint);
      // console.log(intersectionPoint);
      // console.log(stateIntersectionPoint.val);
      if(stateMarker.val){
        stateMarker.val.position.copy(intersectionPoint)
      }
      update_pointer3d_plane();
    }
  }
}

//-----------------------------------------------
// PLACE TYPES
//-----------------------------------------------
function place_tile_grid(){
  let isFound = false;
  const gridPosition = stateGrid3DPosition.val;
  for (const objModel of scene.children) {
    // Access child properties
    if(
      (objModel.position.x == gridPosition.x)&&
      (objModel.position.y == gridPosition.y)&&
      (objModel.position.z == gridPosition.z)){
      if(objModel?.userData?.type=='tile'){
        isFound=true;
        console.log("FOUND SAME POSITION");
      }
    }
  }
  if(!isFound){
    const conn = stateConn.val;
    conn.reducers.createMapTile({
      x:gridPosition.x,
      y:gridPosition.y,
      z:gridPosition.z,
    })
  }
}

function delete_tile_grid(){
  // let isFound = false;
  const conn = stateConn.val;
  const gridPosition = stateGrid3DPosition.val;
  for (const objModel of scene.children) {
    // Access child properties
    if(
      (objModel.position.x == gridPosition.x)&&
      (objModel.position.y == gridPosition.y)&&
      (objModel.position.z == gridPosition.z)){
      if(objModel?.userData?.type=='tile'){
        console.log(objModel.userData);
        // isFound=true;
        console.log("FOUND SAME POSITION");
        conn.reducers.deleteMapTile({id:objModel.userData.row.entityId});
        break;
      }
    }
  }
}

function place_marker(){
  try {
    const conn = stateConn.val;
    conn.reducers.createMapMarker({
      x:statePointer3D.val.x,
      y:statePointer3D.val.y,
      z:statePointer3D.val.z,
    })
  } catch (error) {
    console.log("conn place marker error");
  }
}

function delete_marker(){
  // statePointer2D
  const pointer = statePointer2D.val;
  raycaster.setFromCamera(pointer, camera);
  const markers = stateMarkers.val;
  const intersects = raycaster.intersectObjects(markers, false);
  if (intersects.length > 0) {
    console.log("intersect...");
    const obj = intersects[0].object;
    console.log(obj);
    axesHelper.position.copy(obj.position);
    if(obj.userData?.tag === "Marker"){
      stateSelectEntityId.val = obj.userData?.row?.entityId
      console.log("FOUND TO DELETE?");
      try {
        const conn = stateConn.val;
        if(obj.userData?.row?.entityId){
          conn.reducers.deleteMapMarker({
            id:obj.userData?.row.entityId
          });
        }
      } catch (error) {
        console.log("delete marker error ")
      }
    }
  }
}

function onKeyDown(event){
  console.log(event.code);

  if(event.code == 'KeyB'){
    if(stateBuildSelect.val == 'MARKER'){
      console.log('MARKER');
      place_marker();
    }

    if(stateBuildSelect.val == 'TILE'){
      console.log('TILE');
      place_tile_grid();
    }
  }
  if(event.code == 'KeyX'){
    if(stateBuildSelect.val == 'TILE'){
      delete_tile_grid();
    }
    if(stateBuildSelect.val == 'MARKER'){
      delete_marker();
    }
  }

  if(event.code == 'Tab'){
    if(stateOrbitControl.val){
      stateOrbitControl.val.enabled = !stateOrbitControl.val.enabled;
    }
  }
}
//-----------------------------------------------
// DRAG
//-----------------------------------------------
const raycaster = new THREE.Raycaster();
let selectedObject = null;
function onMouseDown(event){
  let pointer = new THREE.Vector3();
  if (event.button !== 0) return; // left click only
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const markers = stateMarkers.val;
  const intersects = raycaster.intersectObjects(markers, false);
  if (intersects.length > 0) {
    console.log("intersect...");
    const obj = intersects[0].object;
    console.log(obj);
    axesHelper.position.copy(obj.position);
    if(obj.userData?.tag === "Marker"){
      stateSelectEntityId.val = obj.userData?.row?.entityId
      selectedObject = obj; // your group
    }
  }
  if(selectedObject){
    stateOrbitControl.val.enabled = false;
    stateIsDrag.val = true;
  }
}

function onMouseMoveDrag(event){
  if (!selectedObject || !stateIsDrag.val) return;
  // ray cast plane ???
  if(selectedObject){
    const pointer3d = statePointer3D.val;
    selectedObject.position.copy(pointer3d);
    try {
      if(selectedObject.userData?.row){
        console.log("update?");
        const conn = stateConn.val;
        conn.reducers.updateMapMarker({
          id:selectedObject.userData.row.entityId,
          x:pointer3d.x,
          y:pointer3d.y,
          z:pointer3d.z,
        })
      }
    } catch (error) {
      console.log("conn drag marker error!");
    }
  }
}

function onMouseUp(event){
  if (selectedObject) {
    stateOrbitControl.val.enabled = true;
    stateIsDrag.val = false;
    selectedObject = null;
    stateSelectEntityId.val=null;
  }
}

//-----------------------------------------------
// LISTEN
//-----------------------------------------------
function setupListens(){
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMoveDrag);   // keep your existing onPointerMove for the pointer3d / tile preview
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('pointermove', onPointer3DPlaneMove);
  window.addEventListener('keydown', onKeyDown);
}
//-----------------------------------------------
// SETUP RENDER AND SCENE
//-----------------------------------------------
export function setupThree(){
  setup_renderer();
  setup_scene(); 
  // setup_editor_panel();
  // animate();
  renderer.setAnimationLoop(animate);
}

