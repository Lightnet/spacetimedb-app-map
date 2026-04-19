//-----------------------------------------------
// 
//-----------------------------------------------
import { DbConnection, tables } from '../module_bindings';
import { dbMapMarkers, stateConn } from "../context";
import { addOrUpdateEntity, deleteEntity } from '../helper';

function onInsert_MapTile(ctx, row){
  console.log("insert Map Tile:", row);
  addOrUpdateEntity(dbMapMarkers, row);
}
function onUpdate_MapTile(ctx,oldRow, newRow){
  addOrUpdateEntity(dbMapMarkers, newRow);
}
function onDelete_MapTile(ctx,row){
  deleteEntity(dbMapMarkers, row.entityId)
}
export function setupDBMapMarker(){
  const conn = stateConn.val;
  conn
    .subscriptionBuilder()
    .subscribe(tables.mapMarkers);
  conn.db.mapMarkers.onInsert(onInsert_MapTile);
  conn.db.mapMarkers.onUpdate(onUpdate_MapTile);
  conn.db.mapMarkers.onDelete(onDelete_MapTile);
}