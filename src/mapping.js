import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js";
import { ViewportGizmo } from "three-viewport-gizmo";
import { 
  FloatingWindow,
  MessageBoard,
} from "vanjs-ui"


import { DbConnection, tables } from './module_bindings';

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';

const { div, p, button, input, img } = van.tags;
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
  offset_marker:{x:0,y:4,z:0},
  factor: 50,
  id:'',
  selectId:'',
  markerFolders: [],
  markerRows: [],
  gridFolders: [],
  gridRows: [],
  images: [], // table images
}

let paneMarker;
let paneGrid;
let paneProps;
var pointerPanel;
var gridPanel;
var ph_plane;
var marker;
var markers = [];
var grids = [];
var isDrag = false;

let selectedObject = null;
let dragOffset = new THREE.Vector3();   // world-space offset from click point to marker center
let dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // horizontal plane at y = 0

// ────────────────────────────────────────────────
// Raycaster + mouse
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();   // normalized device coords (-1 to +1)
const intersectionPoint = new THREE.Vector3(); // where we'll store result

setup_editor_panel();

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
  setupDBImage();
  setupDBMapping();
  setupDBMapTile();
}

function onInsert_Image(ctx, row){
  MappingConfig.images.push(row);
}

function setupDBImage(){
  conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      ctx.db.image.onInsert(onInsert_Image)
    })
    .onError((ctx, error) => {
      console.error(`Subscription failed: ${error}`);
    })
    .subscribe(tables.image);
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
function update_pane_marker(){
  MappingConfig.markerFolders.forEach(f => f.dispose());
  MappingConfig.markerFolders = [];
  MappingConfig.markerRows.forEach((entity, index) => {
    console.log("MappingConfig.markerRows entity:", entity)
    const folder = paneMarker.addFolder({
      title: `${entity.id} Marker`,
      expanded: false,
    });
    // folder.addBinding(entity, 'id', { label: 'Name' });
    folder.addBinding(entity, 'position', {  });
    folder.addButton({title:'Select'}).on('click',()=>{
      axesHelper.position.set(entity.position.x,entity.position.y,entity.position.z);
    });
    MappingConfig.markerFolders.push(folder);
  });
}

function onInsert_MapMarker(ctx, row){
  // console.log("map maker:", row);
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
    const _marker = create_model_marker();
    _marker.position.set(row.position.x, row.position.y, row.position.z);
    _marker.position.add(MappingConfig.offset_marker);
    _marker.userData.row = row;
    // console.log(_marker.userData);
    scene.add(_marker);
    markers.push(_marker);
    const isDuplicate = MappingConfig.markerRows.some(r => r.id === row.id);
    // console.log("isDuplicate:", isDuplicate);
    if (!isDuplicate) {
      MappingConfig.markerRows.push(row);
    }
    update_pane_marker();
  }
}
//need to make sure there no override when update while move.
function onUpdate_MapMarker(ctx, oldRow, newRow){
  for (let i = 0; i < scene.children.length; i++) {
    const object3d = scene.children[i];
    if(object3d.userData?.row?.id == newRow.id){
      // console.log("selectedObject:", selectedObject);
      if((selectedObject?.userData?.row?.id != newRow.id) || (selectedObject == null)){
        let pos = new THREE.Vector3(newRow.position.x,newRow.position.y,newRow.position.z).add(MappingConfig.offset_marker)
        object3d.position.copy(pos)
      }
      break;
    }
  }
}

function onDelete_MapMarker(ctx, row){
  for (let i = 0; i < scene.children.length; i++) {
    const object3d = scene.children[i];
    if(object3d.userData?.row?.id == row.id){
      scene.remove(object3d);
    }
  }
}
//-----------------------------------------------
// DB MAP
//-----------------------------------------------
function setupDBMapping(){
  conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      console.log("test");
      ctx.db.MapMarker.onInsert(onInsert_MapMarker);
      ctx.db.MapMarker.onUpdate(onUpdate_MapMarker);
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
function update_pane_grids(row){
  MappingConfig.gridFolders.forEach(f => f.dispose());
  MappingConfig.gridFolders = [];
  MappingConfig.gridRows.forEach((entity, index) => {
    // console.log("MappingConfig.gridRows entity:", entity)
    const folder = paneGrid.addFolder({
      // title: `${entity.name} (ID: ${entity.id})`,
      title: `${entity.id} Tile`,
      expanded: false,
    });
    // folder.addBinding(entity, 'id', { label: 'Name' });
    folder.addBinding(entity, 'position', {  });
    folder.addButton({title:'Select'}).on('click',()=>{
      axesHelper.position.set(entity.position.x,entity.position.y,entity.position.z);
    });
    MappingConfig.gridFolders.push(folder);
  });
}
function onInsert_MapTile(ctx, row){
  // console.log("map tile:", row);
  let isFound = false;
  for (let i = 0; i < scene.children.length; i++) {
    const object3d = scene.children[i];
    if(object3d.userData?.row?.id == row.id){
      isFound=true;
      break;
    }
  }
  if(isFound==false){
    const _tileMap = create_grid();
    _tileMap.position.set(row.position.x, row.position.y, row.position.z);
    _tileMap.userData.row = row;
    scene.add(_tileMap);
    grids.push(_tileMap);
    const isDuplicate = MappingConfig.gridRows.some(r => r.id === row.id);
    // console.log("isDuplicate:", isDuplicate);
    if (!isDuplicate) {
      MappingConfig.gridRows.push(row);
    }
    update_pane_grids();
  }
}

function onUpdate_MapTile(ctx, oldRow, newRow){

}

function onDelete_MapTile(ctx, row){

}

function setupDBMapTile(){
  conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      // console.log("map tile");
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
function create_model_marker(){
  const t_geometry = new THREE.ConeGeometry( 4, 8, 4 );
  const t_material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe:true
  });
  const _marker = new THREE.Mesh( t_geometry, t_material );
  _marker.rotation.x = Math.PI;
  _marker.userData.tag='Marker';
  return _marker;
  
  // const groupMarker = new THREE.Group();
  // _marker.position.set(0,4,0);
  // _marker.userData = {tag:"Pointer"};
  // groupMarker.add(_marker);
  // groupMarker.userData = {tag:'markPointer'}
  // return groupMarker;
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
  // const cube = new THREE.Mesh(
  //   new THREE.BoxGeometry(2,2,2),
  //   new THREE.MeshBasicMaterial({
  //     color: 0xff3366,
  //     wireframe:true
  //   })
  // );
  // cube.visible = false;
  const geometry = new THREE.BoxGeometry(2,2,2);
  const wireframe = new THREE.WireframeGeometry( geometry );
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
      marker.position.copy(intersectionPoint);
      marker.visible = true;
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
      // let p = create_grid();
      // p.position.set(place_grid.x,place_grid.y,place_grid.z);
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

    }
  }
}
// ────────────────────────────────────────────────
// DELETE TILE
// ────────────────────────────────────────────────
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
        grids = grids.filter(item => item !== object);
      }
    }
  }
}
// ────────────────────────────────────────────────
// DELETE MARKER
// ────────────────────────────────────────────────
function raycast_delete_marker(){
  //check to delete marker
  console.log("selectedObject:", selectedObject);

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(markers, true); // true = recursive (in case you have groups)
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if(obj.userData.tag === "Marker"){
      console.log("found marker");
      // let parent = obj.parent;
      let parent = obj;
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
  // const triMarker = create_model_marker();
  // triMarker.position.copy(pointer3d);
  // scene.add(triMarker);
  // markers.push(triMarker);
  try {
    conn.reducers.createMapMarker({
      x:pointer3d.x,
      y:pointer3d.y,
      z:pointer3d.z,
    })
  } catch (error) {
    console.log("conn place marker error");
  }
}
// ────────────────────────────────────────────────
// SET UP SCENE
// ────────────────────────────────────────────────
function setup_scene(){
  setup_lights();
  scene.add( create_grid_helper() );
  // triMarker = create_model_marker();
  // tetrahedron = triMarker;
  // scene.add( triMarker );
  ph_plane = create_plane_floor();
  scene.add( ph_plane );
  marker = cube_marker();
  scene.add(marker);
  setup_camera_controllers()
}
// ────────────────────────────────────────────────
// Events
// ────────────────────────────────────────────────
// Called on mousedown
// need work on grid, marker and other entities.
function onMouseDown(event) {
  if (event.button !== 0) return; // left click only
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(markers, true); // true = recursive (in case you have groups)
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    console.log("mouse down marker: ",obj);
    if(obj.userData.tag === "Marker"){
      console.log("found...");
      // selectedObject = obj.userData.tag === "Pointer" ? obj.parent : obj.parent; // your group
      // selectedObject = obj.parent; // your group
      selectedObject = obj; // your group
    }
    
    if (selectedObject) {
      controls.enabled = false;           // disable orbit while dragging
      isDrag = true;

      // Calculate exact offset so the marker doesn't jump
      const intersectPoint = intersects[0].point;
      // dragOffset.copy(selectedObject.position).sub(intersectPoint);
      selectedObject.position.copy(intersectPoint);

      // Optional: if you want to drag from the exact clicked height instead of forcing y=0
      // dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), intersectPoint);
    }
  }
}

// Called on mouse move (only the drag part)
function onMouseMoveDrag(event) {
  if (!selectedObject || !isDrag) return;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersectPoint = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
    // Apply offset so it feels natural
    dragOffset.set(MappingConfig.offset_marker.x,MappingConfig.offset_marker.y,MappingConfig.offset_marker.z)
    selectedObject.position.copy(intersectPoint).add(dragOffset);

    try {
      if(selectedObject.userData?.row){
        conn.reducers.updateMapMarker({
        id:selectedObject.userData.row.id,
        x:intersectPoint.x,
        y:intersectPoint.y,
        z:intersectPoint.z,
      })
      }
      
    } catch (error) {
      console.log("conn drag marker error!");
    }

    // Optional: snap to your grid while dragging
    // selectedObject.position.x = Math.round(selectedObject.position.x / grid_size) * grid_size;
    // selectedObject.position.z = Math.round(selectedObject.position.z / grid_size) * grid_size;
    // (y stays 0 or whatever your marker base is)
  }
}

// Called on mouse up
function onMouseUp() {
  if (selectedObject) {
    controls.enabled = true;
    isDrag = false;
    selectedObject = null;
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

function setup_editor_panel(){
  const pane = new Pane();
  const hotKeyFolder = pane.addFolder({title: 'Hot Keys'});
  hotKeyFolder.addBinding(MappingConfig, 'key1',{disabled: true });
  hotKeyFolder.addBinding(MappingConfig, 'key2',{disabled: true });
  hotKeyFolder.addBinding(MappingConfig, 'key3',{disabled: true });

  const imageFolder = pane.addFolder({title: 'image'});
  imageFolder.addButton({title:'Upload'}).on('click',()=>{
    open_window_upload();
  });
  imageFolder.addButton({title:'Images'}).on('click',()=>{
    open_window_icon();
  });

  const selectFolder = pane.addFolder({title: 'Select'});

  selectFolder.addButton({title:'Grid'})
  selectFolder.addButton({title:'Marker'})
  selectFolder.addButton({title:'Text'})
  selectFolder.addButton({title:'Voxel'})
  // selectFolder.addButton({title:'Measure'})
  selectFolder.addButton({title:'Monster'})
  // selectFolder.addButton({title:'Boss'})
  // selectFolder.addButton({title:'Chest'})
  // selectFolder.addButton({title:'City'})
  // selectFolder.addButton({title:'Town'})
  // selectFolder.addButton({title:'Town'})

  const gridFolder = pane.addFolder({title: 'Position'});
  pointerPanel = gridFolder.addBinding(MappingConfig, 'pointer3d',{disabled: true });
  gridPanel = gridFolder.addBinding(MappingConfig, 'grid_pos',{disabled: true });


  const rotFolder = pane.addFolder({title: 'Rotate'});
  gridPanel = rotFolder.addBinding(MappingConfig.rot, 'x',{}).on('change', (ev) => {
    // console.log(ev);
    // tetrahedron.rotateX(degrees_to_radians(ev.value));
    tetrahedron.rotation.x = degrees_to_radians(ev.value)
  });
  gridPanel = rotFolder.addBinding(MappingConfig.rot, 'y',{}).on('change', (ev) => {
    // console.log(ev);
    // tetrahedron.rotateY(degrees_to_radians(ev.value));
    tetrahedron.rotation.y = degrees_to_radians(ev.value)
  });
  gridPanel = rotFolder.addBinding(MappingConfig.rot, 'z',{}).on('change', (ev) => {
    // console.log(ev);
    // tetrahedron.rotateZ(degrees_to_radians(ev.value));
    tetrahedron.rotation.z = degrees_to_radians(ev.value)
  });

  const entityEl = div({style:`position:fixed;top:0;left:0;`});
  van.add( document.body, entityEl);

  const paneEntity = new Pane({container:entityEl});
  paneEntity.addBinding(MappingConfig, 'id');
  paneEntity.addBinding(MappingConfig, 'selectId');
  
  paneProps = paneEntity.addFolder({
    title: 'Props',
  });

  paneMarker = paneEntity.addFolder({
    title: 'Markers',
  });
  paneMarker.element.style["max-height"] = '280px';
  paneMarker.element.style["overflow-y"] = 'auto';

  paneGrid = paneEntity.addFolder({
    title: 'Grids',
  });
  paneGrid.element.style["max-height"] = '280px';
  paneGrid.element.style["overflow-y"] = 'auto';

  // const folderMarkers = paneEntity.addFolder({
  //   title: 'Markers',
  // });
}


function open_window_upload(){
  van.add(document.body, window_upload())
}

function window_upload(){
  const closed = van.state(false);
  const width = van.state(300);
  const height = van.state(220);
  const fileEl = input({onchange:onChangeFile,type:"file"});
  const iamgeEl = img({width:64,height:64});

  function onChangeFile(){
    const file = fileEl.files[0];
    if(file){
      const tempUrl = URL.createObjectURL(file);
      iamgeEl.src = tempUrl;
    }
  }

  async function upload_file(event){
    console.log(event);
    console.log(fileEl);
    const file = fileEl.files[0];
    if(file){
      console.log(file);
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);
      try {
      conn.reducers.uploadImage({
        name:file.name,
        mimeType:file.type,
        data:fileBytes
      });  
      console.log("pass!");
      closed.val = true;
      } catch (error) {
        console.log("upload failed!");
      }
    }
  }

  return FloatingWindow({title: "Upload Image File:", closed, width:width.val, height, closeCross: null},
    div({style: "display: flex; flex-direction: column; justify-content: center;"},
      p("Preview"),
      iamgeEl,
      p("Select Single Image!"),
      fileEl,
      button({onclick:upload_file}, "Upload"),
      button({onclick: () => closed.val = true}, "Close"),
    ),
  )
}

function open_window_icon(){
  van.add(document.body, window_images())
}

function window_images(){
  const closed = van.state(false);
  const width = van.state(300);
  const height = van.state(220);
  const iamgeEl = img({width:64,height:64});
  const imagesEl = div();

  function selectImageId(id){
    console.log("id: ", id);
  }

  function loadImages(){
    for(const image of MappingConfig.images){

      const blob = new Blob([image.data], { type: "image/png" }); 
      const tempUrl = URL.createObjectURL(blob);
      // const tempUrl = URL.createObjectURL(image.data);
      const tmp = img({width:64, height:64, onclick:()=>selectImageId(image.id)});
      tmp.src = tempUrl;
      van.add(imagesEl, tmp);
    }
  }

  loadImages();

  return FloatingWindow({title: "Icons:", closed, width:width.val, height, closeCross: null},
    div({style: "display: flex; flex-direction: column; justify-content: center;"},
      p("Preview"),
      iamgeEl,
      p("Select Icon:"),
      imagesEl,
      button({onclick: () => closed.val = true}, "Close"),
    ),
  )

}

setup_renderer();
setup_scene(); 
// setup_editor_panel();
animate();
console.log("Planet with hover lat/lon coordinates");

