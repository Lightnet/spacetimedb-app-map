import * as THREE from 'three';
import van from "vanjs-core";

// Spacetimedb
export const stateConn = van.state(null);
export const dbEntities = van.state(new Map());
export const dbMapTiles = van.state(new Map());
export const dbMapMarkers = van.state(new Map());
export const dbTransform3ds = van.state(new Map());

export const buildTypes = van.state([
  // {text:'Grid', value:'GRID'},
  {text:'Tile', value:'TILE'},
  {text:'Marker', value:'MARKER'},
  {text:'Voxel', value:'VOXEL'},
  {text:'Text', value:'TEXT'},
]);
//localstroage
let buildType = localStorage.getItem('BUILDTYPE') ?? 'TILE';
export const stateBuildSelect = van.state(buildType);


// THREEE
export const stateScene = van.state(null);
export const stateOrbitControl = van.state(null);

export const statePHPlane = van.state(null);
export const stateMarker = van.state(null);
export const stateGridSize = van.state(32.0);

export const stateGrids = van.state([]); // meshes
export const stateMarkers = van.state([]); // meshes

export const stateSelectObject = van.state(null);
export const stateSelectEntityId = van.state(null);

// export const stateToggleOrbit = van.state(true); //

export const stateDragOffset = van.state(new THREE.Vector3()); // world-space offset from click point to marker center
export const stateDragPlane = van.state(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)); // world-space offset from click point to marker center
export const stateIsDrag = van.state(false);

export const stateGrid3DPosition = van.state(new THREE.Vector3());
export const statePointer3D = van.state(new THREE.Vector3());
export const stateRaycaster = van.state(new THREE.Raycaster());
export const statePointer2D = van.state(new THREE.Vector2());
export const stateIntersectionPoint = van.state(new THREE.Vector3());



// testing
export const PARAMS = {
  pointer3d:{x:0,y:0,z:0},
}



