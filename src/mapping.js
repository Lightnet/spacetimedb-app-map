import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js";
import { ViewportGizmo } from "three-viewport-gizmo";

import { DbConnection, tables } from './module_bindings';

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';

const { div } = van.tags;
// ────────────────────────────────────────────────
// Define a function named degrees_to_radians that converts degrees to radians.
function degrees_to_radians(degrees){
  // Store the value of pi.
  var pi = Math.PI;
  // Multiply degrees by pi divided by 180 to convert to radians.
  return degrees * (pi/180);
}

// console.log(OrbitControls);
// grid size
var grid_size = 32.0;
var pointer3d = new THREE.Vector3();
var place_grid = new THREE.Vector3();
var longitude = 0; // y
var latitude  = 0; // x

const MappingConfig = {
  myBoolean: true,
  key1:"B = Build",
  key2:"X = Delete",
  key3:"M = Pointer",
  pointer3d:{x:0,y:0,z:0},
  grid_pos:{x:0,y:0,z:0},
  rot:{x:40.0,y:0,z:0}, //36.00
}
const state = {
  entities: [
    // { id: '1', name: 'Player', speed: 5 },
    // { id: '2', name: 'Enemy', speed: 3 },
  ]
};

const PARAMS = {
  factor: 50,
  id:'',
  selectId:''
};

var pointerPanel;
var gridPanel;

var triMarker;
var ph_plane;
var tetrahedron;
var marker;
var markers = [];
var isDrag = false;

let selectedMarker = null;
let dragOffset = new THREE.Vector3();   // world-space offset from click point to marker center
let dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // horizontal plane at y = 0

const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem('auth_token') || undefined)
  .onConnect((conn, identity, token) => {
    localStorage.setItem('auth_token', token);
    console.log("connect...");
    setupDB();
  })
  .onDisconnect(() => {
    console.log('Disconnected from SpacetimeDB');
    // el_status.val = 'Disconnected';
  })
  .onConnectError((_ctx, error) => {
    console.error('Connection error:', error);
    // statusEl.textContent = 'Error: ' + error.message;
    // statusEl.style.color = 'red';
  })
  .build();

function setupDB(){
  setupDBUser();
  setupDBMapping();
  setupDBMapTile();
}
function setupDBUser(){
  conn
    .subscriptionBuilder()
    // .onApplied((ctx) => apply_user(ctx))
    .onError((ctx, error) => {
      console.error(`Subscription failed: ${error}`);
    })
    .subscribe(tables.user);
}
//-----------------------------------------------
// MAP MARKER
//-----------------------------------------------
function onInsert_MapMarker(ctx, row){
  console.log("map maker:", row);
  let isFound = false;

  for (let i = 0; i < scene.children.length; i++) {
    const object3d = scene.children[i];
    if(object3d.userData?.row?.id == row.id){
      isFound=true;
      break;
    }
    // Perform actions
  }
  if(isFound==false){
    const triMarker = create_tri_marker();
    triMarker.position.set(row.position.x, row.position.y, row.position.z);
    triMarker.userData.row = row;
    console.log(triMarker.userData);
    scene.add(triMarker);
    markers.push(triMarker);
  }
}

function onUpdate_MapMarker(ctx, oldRow, newRow){


}

function onDelete_MapMarker(ctx, row){
  for (let i = 0; i < scene.children.length; i++) {
    const object3d = scene.children[i];
    if(object3d.userData?.row?.id == row.id){
      scene.remove(object3d);
    }
  }
}

function setupDBMapping(){
  conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      console.log("test");
      ctx.db.MapMarker.onInsert(onInsert_MapMarker);
      ctx.db.MapMarker.onDelete(onDelete_MapMarker);
    })
    .onError((ctx, error) => {
      console.error(`Subscription failed: ${error}`);
    })
    .subscribe(tables.MapMarker);
  // console.log(tables)
}

//-----------------------------------------------
// MAP GRID
//-----------------------------------------------
function onInsert_MapTile(ctx, row){
  console.log("map tile:", row);
  let isFound = false;

  for (let i = 0; i < scene.children.length; i++) {
    const object3d = scene.children[i];
    if(object3d.userData?.row?.id == row.id){
      isFound=true;
      break;
    }
    // Perform actions
  }
  if(isFound==false){
    const _tileMap = create_grid();
    _tileMap.position.set(row.position.x, row.position.y, row.position.z);
    _tileMap.userData.row = row;
    scene.add(_tileMap);
    // markers.push(_tileMap);
  }
}

function onUpdate_MapTile(ctx, oldRow, newRow){

}

function onDelete_MapTile(ctx, row){

}

var MapTileSub;
function setupDBMapTile(){
  MapTileSub = conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      console.log("map tile");
      ctx.db.MapTile.onInsert(onInsert_MapTile);
      ctx.db.MapTile.onUpdate(onUpdate_MapTile);
      ctx.db.MapTile.onDelete(onDelete_MapTile);
    })
    .onError((ctx, error) => {
      console.error(`Subscription failed: ${error}`);
    })
    .subscribe(tables.MapTile);
  // console.log(tables)
}




const axesHelper = new THREE.AxesHelper( 5 );
// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022); // dark space feel
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// camera.position.z = 6;
camera.position.z = 64;
camera.position.y = 64;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
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
const controls = new OrbitControls( camera, renderer.domElement );
const gizmo = new ViewportGizmo(camera, renderer,{
  placement: "bottom-right",
});
gizmo.attachControls(controls);

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
function create_grid_helper(){
  const size = 1024;
  const divisions = 32;
  const gridHelper = new THREE.GridHelper( size, divisions );
  gridHelper.position.set(16,-1.0,16);
  return gridHelper
}
// scene.add( create_grid_helper() );
//-----------------------------------------------
// Tetrahedron Geometry
//-----------------------------------------------
function create_tri_marker(){
  const t_geometry = new THREE.TetrahedronGeometry(8);
  // t_geometry.rotateX(Math.PI * 0.5); 
  // t_geometry.rotateX(degrees_to_radians(40))
  // t_geometry.rotateX(Math.PI*40); 
  const t_material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe:true
  });
  const tetrahedron = new THREE.Mesh( t_geometry, t_material );
  // tetrahedron.rotateX(degrees_to_radians(90));
  tetrahedron.rotateX(degrees_to_radians(35));
  // tetrahedron.rotateY(degrees_to_radians(80));
  tetrahedron.rotateZ(degrees_to_radians(45));
  const groupMarker = new THREE.Group();
  tetrahedron.position.set(0,8,0);
  tetrahedron.userData = {
    tag:"Pointer"
  };
  groupMarker.add(tetrahedron);
  // groupMarker.userData = {tag:'markPointer'}
  return groupMarker;
}
// triMarker = create_tri_marker();
// scene.add( triMarker );
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
// const ph_plane = create_plane_floor();
// scene.add( ph_plane );
//-----------------------------------------------
// CREATE GRID
//-----------------------------------------------
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

function cube_marker(){
  const cubeMarker = new THREE.Mesh(
    new THREE.BoxGeometry(2,2,2),
    new THREE.MeshBasicMaterial({
      color: 0xff3366,
      wireframe:true
    })
  );
  cubeMarker.visible = false;
  return cubeMarker
}

// ────────────────────────────────────────────────
// Animation + rotation
function update_position_placeholder_tile(){
  if(pointer3d){
    // console.log(pointer3d)
    let grid_x  = Math.round(pointer3d.x / grid_size) * grid_size;
    let grid_y = Math.round(pointer3d.y / grid_size) * grid_size;
    let grid_z  = Math.round(pointer3d.z / grid_size) * grid_size;

    MappingConfig.grid_pos = {
      x: grid_x,
      y: grid_y,
      z: grid_z
    };

    // console.log("g x:", grid_x, " y:", grid_y, " z:",grid_z);
    MappingConfig.pointer3d.x = pointer3d.x;
    MappingConfig.pointer3d.y = pointer3d.y;
    MappingConfig.pointer3d.z = pointer3d.z;
    if (pointerPanel) pointerPanel.refresh();
    if (gridPanel) gridPanel.refresh();

    place_grid.set(grid_x, grid_y, grid_z);

    if(ph_plane){
      ph_plane.position.x = grid_x;
      // ph_plane.position.y = grid_z;
      ph_plane.position.z = grid_z;
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
    if(marker){
      // marker.position.copy(intersectionPoint);
      // marker.visible = true;
    }

    // ─── Here is your desired Vector3 ────────────────────────
    // console.log("Ground position:", intersectionPoint.x.toFixed(2),
    //                                   intersectionPoint.y.toFixed(2),
    //                                   intersectionPoint.z.toFixed(2));
  } else {
    marker.visible = false;
  }
  // raycastMarkerPointer();
}

// ────────────────────────────────────────────────
// THREE UPDATE
// ────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
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
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gizmo.update();
}
// ────────────────────────────────────────────────
// PLACE GRID
// ────────────────────────────────────────────────
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
      // 
      console.log("mesh");
      console.log(p);

      try {
        conn.reducers.createMapTile({
          x:place_grid.x,
          y:place_grid.y,
          z:place_grid.z,
        })
      } catch (error) {
        console.log("conn place tile error");
      }

      state.entities.push({
        id:p.uuid,
        name:p.uuid,
        speed:0,
        x: p.position.x,
        y: p.position.y,
        z: p.position.z,
      })
      updateEntityList();
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
        // console.log("FOUND SAME POSITION");
        // console.log("1 x:", grid_x," y:", grid_x," z:", grid_x,);
        // console.log("2 x:", grid_x2," y:", grid_x2," z:", grid_x2);
        // console.log(objModel.position);
        try {
          if (objModel.userData?.row?.id){
            conn.reducers.deleteMapTile({id:objModel.userData.row.id});
          }
        } catch (error) {
          console.log("conn map tile delete error!");
        }
        scene.remove(objModel);
      }
    }
  }
}

function raycast_delete_marker(){
  //check to delete marker
  console.log("selectedMarker:", selectedMarker);

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(markers, true); // true = recursive (in case you have groups)
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if(obj.userData.tag === "Pointer"){
      console.log("found marker");
      let parent = obj.parent;
      console.log(obj.userData);
      try {
        if(parent.userData?.row?.id){
          conn.reducers.deleteMapMarker({
            id:parent.userData.row.id
          });
        }
      } catch (error) {
        console.log("delete marker error ")
      }
    }
  }

}

// ────────────────────────────────────────────────
// PLACE MARK POINTER
// ────────────────────────────────────────────────
function placeMarkPointer(){
  const triMarker = create_tri_marker();
  triMarker.position.copy(pointer3d);
  try {
    conn.reducers.createMapMarker({
      x:pointer3d.x,
      y:pointer3d.y,
      z:pointer3d.z,
    })
  } catch (error) {
    console.log("conn place marker error");
  }
  scene.add(triMarker);
  markers.push(triMarker);
}

// ────────────────────────────────────────────────
// SET UP SCENE
// ────────────────────────────────────────────────
function setup_scene(){
  setup_lights();
  scene.add( create_grid_helper() );
  triMarker = create_tri_marker();
  tetrahedron = triMarker;
  scene.add( triMarker );
  ph_plane = create_plane_floor();
  scene.add( ph_plane );
  marker = cube_marker();
  scene.add(marker);
}

setup_scene();

// ────────────────────────────────────────────────
// Events
// ────────────────────────────────────────────────
// Called on mousedown
function onMouseDown(event) {
  if (event.button !== 0) return; // left click only
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(markers, true); // true = recursive (in case you have groups)
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if(obj.userData.tag === "Pointer"){
      // selectedMarker = obj.userData.tag === "Pointer" ? obj.parent : obj.parent; // your group
      selectedMarker = obj.parent; // your group
    }
    
    if (selectedMarker) {
      controls.enabled = false;           // disable orbit while dragging
      isDrag = true;

      // Calculate exact offset so the marker doesn't jump
      const intersectPoint = intersects[0].point;
      // dragOffset.copy(selectedMarker.position).sub(intersectPoint);
      selectedMarker.position.copy(intersectPoint);

      // Optional: if you want to drag from the exact clicked height instead of forcing y=0
      // dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), intersectPoint);
    }
  }
}
// Called on mouse move (only the drag part)
function onMouseMoveDrag(event) {
  if (!selectedMarker || !isDrag) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersectPoint = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
    // Apply offset so it feels natural
    selectedMarker.position.copy(intersectPoint).add(dragOffset);

    // Optional: snap to your grid while dragging
    // selectedMarker.position.x = Math.round(selectedMarker.position.x / grid_size) * grid_size;
    // selectedMarker.position.z = Math.round(selectedMarker.position.z / grid_size) * grid_size;
    // (y stays 0 or whatever your marker base is)
  }
}
// Called on mouse up
function onMouseUp() {
  if (selectedMarker) {
    controls.enabled = true;
    isDrag = false;
    selectedMarker = null;
  }
}
// ────────────────────────────────────────────────
// Attach the new listeners
// ────────────────────────────────────────────────
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMoveDrag);   // keep your existing onPointerMove for the pointer3d / tile preview
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('resize', onWindowResize);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('keydown', (event)=>{
  // console.log(event.code);
  if(event.code == 'KeyB'){
    place_grid_tile();
  }
  if(event.code == 'KeyX'){
    delete_grid_tile();
    raycast_delete_marker();
  }
  if(event.code == 'KeyM'){
    placeMarkPointer();
  }
});
// animate();

const pane = new Pane();
pane.addBinding(MappingConfig, 'key1',{disabled: true });
pane.addBinding(MappingConfig, 'key2',{disabled: true });
pane.addBinding(MappingConfig, 'key3',{disabled: true });

pointerPanel = pane.addBinding(MappingConfig, 'pointer3d',{disabled: true });
gridPanel = pane.addBinding(MappingConfig, 'grid_pos',{disabled: true });

gridPanel = pane.addBinding(MappingConfig.rot, 'x',{}).on('change', (ev) => {
  // console.log(ev);
  // tetrahedron.rotateX(degrees_to_radians(ev.value));
  tetrahedron.rotation.x = degrees_to_radians(ev.value)
});

gridPanel = pane.addBinding(MappingConfig.rot, 'y',{}).on('change', (ev) => {
  // console.log(ev);
  // tetrahedron.rotateY(degrees_to_radians(ev.value));
  tetrahedron.rotation.y = degrees_to_radians(ev.value)
});

gridPanel = pane.addBinding(MappingConfig.rot, 'z',{}).on('change', (ev) => {
  // console.log(ev);
  // tetrahedron.rotateZ(degrees_to_radians(ev.value));
  tetrahedron.rotation.z = degrees_to_radians(ev.value)
});


// gridPanel = pane.addBinding(MappingConfig, 'rot',{}).on('change', (ev) => {
//   console.log(ev);
//   tetrahedron.rotateX(degrees_to_radians(ev.value.x));
//   // tetrahedron.rotateY(degrees_to_radians(MappingConfig.rot.y));
//   // tetrahedron.rotateZ(degrees_to_radians(ev.value.z));
//   // tetrahedron.rotation.x = degrees_to_radians(ev.value.x) // 36.0
// });
const entityEl = div({style:`position:fixed;top:0;left:0;`});
van.add( document.body, entityEl);

const paneEntity = new Pane({container:entityEl});
paneEntity.addBinding(PARAMS, 'id');
paneEntity.addBinding(PARAMS, 'selectId');
let entityFolders = []; // Track folders to dispose them later
// const btn_delete = paneEntity.addButton({
//   title: 'Delete',
// });
// const btn_update = paneEntity.addButton({
//   title: 'Update',
// });
paneEntity.addButton({ title: '＋ Add New Entity' }).on('click', () => {
  const newId = (state.entities.length + 1).toString();
  state.entities.push({ id: newId, name: `Entity ${newId}`, speed: 0 });
  updateEntityList();
});
const folderEntities = paneEntity.addFolder({
  title: 'Entities',
});
// console.log(folderEntities);
// handle scroll height panel mod fixed.
folderEntities.element.style["max-height"] = '280px';
folderEntities.element.style["overflow-y"] = 'auto';

function updateEntityList() {
  // Clear existing entity folders
  entityFolders.forEach(f => f.dispose());
  entityFolders = [];

  // Re-add a folder for each entity in the current list
  state.entities.forEach((entity, index) => {
    const folder = folderEntities.addFolder({
      // title: `${entity.name} (ID: ${entity.id})`,
       title: `${entity.name}`,
      expanded: false,
    });

    folder.addBinding(entity, 'name', { label: 'Name' });
    // folder.addBinding(entity, 'speed', { min: 0, max: 10, label: 'Speed' });
    folder.addBinding(entity, 'x', {  });
    folder.addBinding(entity, 'y', {  });
    folder.addBinding(entity, 'z', {  });

    folder.addButton({ title: 'Select' }).on('click', () => {
      console.log(entity);
      axesHelper.position.set(entity.x,entity.y,entity.z);
    })
    // Add a delete button inside the folder
    folder.addButton({ title: 'Remove Entity' }).on('click', () => {
      state.entities.splice(index, 1); // Remove from data
      updateEntityList();             // Refresh UI

      scene.traverse((obj)=>{
        if(obj){
          if(obj.uuid == entity.id){
            scene.remove(obj);
          }
        }
        
      });
      
    });

    entityFolders.push(folder);
  });
}


// const folderMarkers = paneEntity.addFolder({
//   title: 'Markers',
// });
animate();
console.log("Planet with hover lat/lon coordinates");

