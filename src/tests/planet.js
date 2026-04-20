import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// console.log(OrbitControls);

// https://x.com/i/grok?conversation=2031498716230857200

import { DbConnection, tables } from './module_bindings';
import { Identity } from 'spacetimedb';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js";

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';
const {div, button, label, input, li, ul} = van.tags;
const el_status = van.state('None');
const username = van.state('Guest');
var isDrag = false;
var interactiveObjects = [];
var interactiveObject = null;


function apply_user(ctx){
  // console.log("apply");
  console.log(`Ready with ${ctx.db.user.count()} users`);
  // console.log(ctx);
}

function apply_messages(ctx){
  // console.log("apply");
  console.log(`Ready with ${ctx.db.message.count()} messages`);
  // console.log(ctx);
}

const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem('auth_token') || undefined)
  .onConnect((conn, identity, token) => {
    localStorage.setItem('auth_token', token);
    // console.log('Connected with identity:', identity.toHexString());
    // el_status.val = 'Connected';
    // console.log("identity: ", identity);
    // const user = conn.db.user.identity.find(identity);//nope
    // const user = conn.db.user.identity.find('0x'+identity.toHexString());
    // const user = conn.db.user.identity.find('0x'+identity.toHexString());
    // console.log("user: ",user);
    // current_id = identity;
    // const user = conn.db.user.identity.find(identity);//nope
    // console.log("user: ",user);

    conn
      .subscriptionBuilder()
        .onApplied((ctx) => apply_user(ctx))
        .onError((ctx, error) => {
          console.error(`Subscription failed: ${error}`);
        })
        .subscribe(tables.user);

    conn
      .subscriptionBuilder()
        .onApplied((ctx) => apply_messages(ctx))
        .onError((ctx, error) => {
          console.error(`Subscription failed: ${error}`);
        })
        .subscribe(tables.message);

    conn
      .subscriptionBuilder()
        .onApplied((ctx) => apply_messages(ctx))
        .onError((ctx, error) => {
          console.error(`Subscription failed: ${error}`);
        })
        .subscribe(tables.planet3d);

    conn.db.user.onInsert((ctx, row)=>{
      // console.log('insert user row');
      // console.log(row);
      // console.log(row.identity.toHexString());
      //console.log(ctx.identity);//nope, does not exist
      // console.log(conn.identity.toHexString());
      // check if current user client to update their name display
      if(row.identity.toHexString() == conn.identity.toHexString()){
        // console.log("found current ID:", conn.identity.toHexString());
        username.val = row.name;
      }
    });

    // any change on user.
    conn.db.user.onUpdate((ctx, oldRow, newRow)=>{
      console.log("update???");
      console.log("oldRow:", oldRow);
      console.log("newRow:", newRow);
    })

    //add message on first and if there old message will be added here.
    conn.db.message.onInsert((ctx, row)=>{
      console.log('insert message row');
      console.log(`Message:`, row.text);

      console.log(row)

      van.add(chat_messages,div(
        label(row.sender.toHexString().substring(0, 8)),
        label(' Msg:'),
        label(row.text),
      ))

    });

    conn.db.planet3d.onInsert((ctx, row)=>{
      console.log('insert planet3d row');
      console.log(row);

      create_marker(row.x,row.y,row.z)

    });

    

  })
  .onDisconnect(() => {
    console.log('Disconnected from SpacetimeDB');
    el_status.val = 'Disconnected';
  })
  .onConnectError((_ctx, error) => {
    console.error('Connection error:', error);
    // statusEl.textContent = 'Error: ' + error.message;
    // statusEl.style.color = 'red';
  })
  .build();


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

const raycaster_mark = new THREE.Raycaster();

function raycast_check_marker(){
  if(isDrag == true){


    return;
  }
  // console.log(interactiveObjects);
  if(interactiveObjects.length > 0){
    // console.log(raycaster_mark);
    raycaster_mark.setFromCamera(pointer, camera);

    const intersects = raycaster_mark.intersectObjects(interactiveObjects);
    if (intersects.length > 0) {
      console.log("found");
      interactiveObject = intersects[0].object;
    }else{
      interactiveObject = null;
    }
  }
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

    if(isDrag){
      let la = lat.toFixed(2);
      let lo = Math.abs(lon).toFixed(2);
      let pos = latLonToCartesian(lon,la);
      console.log(pos);
      interactiveObject.position.x = pos.x;
      interactiveObject.position.y = pos.y;
      interactiveObject.position.z = pos.z;

    }

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
  interactiveObjects.push(planet_marker);
}

function place_marker(){
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(planet);
  if (intersects.length > 0) {
    const point = intersects[0].point.clone(); // world space
    console.log("point");
    console.log(point);
    if(point){
      conn.reducers.createMarkPlanet3D({
        x:point.x,
        y:point.y,
        z:point.z
      });
    }
    // Convert cartesian → spherical coordinates
    const spherical = new THREE.Spherical().setFromCartesianCoords(
      point.x, point.y, point.z
    );
    create_marker(point.x,point.y,point.z);
    // latitude:  90° – polar angle in degrees
    // longitude: azimuthal angle (adjusted to -180°…+180°)
    let lat = 90 - THREE.MathUtils.radToDeg(spherical.phi);
    let lon = THREE.MathUtils.radToDeg(spherical.theta) - 180;

    // Optional: nicer formatting
    const latStr = lat.toFixed(2) + '° ' + (lat >= 0 ? 'N' : 'S');
    const lonStr = Math.abs(lon).toFixed(2) + '° ' + (lon >= 0 ? 'E' : 'W');
    // elabel.textContent = `Lat: ${latStr}   Lon: ${lonStr}`;
    // elabel.style.display = 'block';
    // elabel.style.left = `${event.clientX + 15}px`;
    // elabel.style.top  = `${event.clientY + 15}px`;
  } else {
    // elabel.style.display = 'none';
  }
}

function latLonToCartesian(lat, lon, radius = 2) {
    const phi   = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);

    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi)
    };
}

// test
function place_coordinate_marker(){
  // altitude / Elevation = hieght
  // longitude = y
  // Latitude  = x
  // need to convert to match the planet
  // example [0,0]

  //create_marker(x,y,z);

  // let lat = 0;
  // let lon = 0;
  // let pos = latLonToCartesian(lat, lon);
  // create_marker(pos.x, pos.y, pos.z);


  lat = latitude;
  lon = longitude;
  pos = latLonToCartesian(lat, lon);
  create_marker(pos.x, pos.y, pos.z);

}

// ────────────────────────────────────────────────
// Events
window.addEventListener('resize', onWindowResize);
window.addEventListener('pointermove', onPointerMove);

window.addEventListener('mousedown',(event)=>{
  console.log('Mouse pressed at:', event.clientX, event.clientY);
  if (interactiveObject != null){
    isDrag = true;
    controls.enableRotate = false
  }
});

window.addEventListener('mouseup',(event)=>{
  console.log('Mouse released');
  if (interactiveObject != null){
    isDrag = false;
    controls.enableRotate = true;
  }
});


window.addEventListener('keydown', function(event) {

  console.log('Key pressed:', event.key); 
  console.log('event.clientX:', event.clientX); 
  console.log(event.code)
  if (event.code  === 'Space') {
    // alert('Enter key pressed!');
    //place_marker();
    place_coordinate_marker();
  }
 
});

animate();

console.log("Planet with hover lat/lon coordinates");