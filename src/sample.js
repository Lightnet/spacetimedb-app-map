// rework build for better code layout.

import van from "vanjs-core";

import { stateConn, stateStatus } from './context';
import { setupDBEntity } from './db/dbentity';
import { setupDBMapTile } from './db/dbmaptile';
import { setupDBMapMarker } from './db/dbmapmarker';
import { setupDBTransform3D } from './db/dbtransform3d';
import { DbConnection, tables } from './module_bindings';
import { setupPane } from './pane_tool';
import { setupThree } from './render';
import { setupDBIcon } from './db/dbicon';
import { setupDBImage } from './db/dbimage';

const {div, label, input, button, img, p, br, style} = van.tags;
const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';

const css = style(`
body{
  background-color:gray;
}
`);

van.add(document.body, css);

const loadingscreen = div({style:`
  display: flex; 
  flex-direction: column;
  justify-content: center; 
  align-items: center;
  height: 100vh;
  `},
  div(
    label("Loading")
  ),
  div(
    label(()=>stateStatus.val),
  )
);

van.add(document.body, loadingscreen);

stateStatus.val = 'Initial connection...';

const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem('auth_token') || undefined)
  .onConnect((conn, identity, token) => {
    localStorage.setItem('auth_token', token);
    console.log("connect...");
    stateStatus.val = 'Connected';
    stateConn.val = conn;
    setup();
    

    // loadingscreen
    document.body.removeChild(loadingscreen);
  })
  .onDisconnect(() => {
    console.log('Disconnected from SpacetimeDB');
    stateStatus.val = 'Disconnected';
  })
  .onConnectError((_ctx, error) => {
    console.error('Connection error:', error);
    stateStatus.val = 'Error: ' + error.message;
    // statusEl.textContent = 'Error: ' + error.message;
    // statusEl.style.color = 'red';
  })
  .build();

function setup(){
  // setup in order
  setupThree();
  setupPane();
  setupDBEntity();
  setupDBMapTile();
  setupDBMapMarker();
  setupDBIcon();
  setupDBImage();
  setupDBTransform3D();
}

