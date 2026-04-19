//-----------------------------------------------
// 
//-----------------------------------------------
import { DbConnection, tables } from '../module_bindings';
import { dbMapTiles, stateConn } from "../context";
import { addOrUpdateEntity, deleteEntity } from '../helper';

function onInsert_MapTile(ctx, row){
  // console.log("insert Map Tile:", row);
  addOrUpdateEntity(dbMapTiles, row);
}
function onUpdate_MapTile(ctx,oldRow, newRow){
  addOrUpdateEntity(dbMapTiles, newRow);
}
function onDelete_MapTile(ctx,row){
  deleteEntity(dbMapTiles, row.entityId)
}
export function setupDBMapTile(){
  const conn = stateConn.val;
  conn
    .subscriptionBuilder()
    .subscribe(tables.mapTiles);
  conn.db.mapTiles.onInsert(onInsert_MapTile);
  conn.db.mapTiles.onUpdate(onUpdate_MapTile);
  conn.db.mapTiles.onDelete(onDelete_MapTile);
}