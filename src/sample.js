
import { stateConn } from './context';
import { setupDBEntity } from './db/dbentity';
import { setupDBMapTile } from './db/dbmaptile';
import { setupDBMapMarker } from './db/dbmapmarker';
import { setupDBTransform3D } from './db/dbtransform3d';
import { DbConnection, tables } from './module_bindings';
import { setupPane } from './pane_tool';
import { setupThree } from './render';
import { setupDBIcon } from './db/dbicon';
import { setupDBImage } from './db/dbimage';
const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';

const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem('auth_token') || undefined)
  .onConnect((conn, identity, token) => {
    localStorage.setItem('auth_token', token);
    console.log("connect...");
    stateConn.val = conn;
    setup();
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

function setup(){
  // setup in order
  setupThree();
  setupPane();
  setupDBEntity();
  setupDBIcon();
  setupDBImage();
  setupDBMapTile();
  setupDBMapMarker();
  setupDBTransform3D();
}


















