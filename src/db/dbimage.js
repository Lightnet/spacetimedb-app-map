//-----------------------------------------------
// 
//-----------------------------------------------
import { DbConnection, tables } from '../module_bindings';
import { dbImages, stateConn } from "../context";

function addOrUpdateEntity(ent) {
  if (!ent || !ent.id) return;
  const newMap = new Map(dbImages.val);           // get current and create copy
  newMap.set(ent.id, ent);
  dbImages.val = newMap;                  // assign new Map → triggers update
}
function deleteEntity(id) {
  if (!id) return;
  // Create new Map without the item
  const newMap = new Map(dbImages.val);
  newMap.delete(id);
  // Update the state (this is what makes VanJS detect the change)
  dbImages.val = newMap;
}

function onInsert_Image(ctx, row){
  // console.log("insert image:", row);
  addOrUpdateEntity( row);
}
function onUpdate_Image(ctx,oldRow, newRow){
  addOrUpdateEntity( newRow);
}
function onDelete_Image(ctx,row){
  deleteEntity( row.entityId)
}
export function setupDBImage(){
  const conn = stateConn.val;
  conn
    .subscriptionBuilder()
    .subscribe(tables.images);
  conn.db.images.onInsert(onInsert_Image);
  conn.db.images.onUpdate(onUpdate_Image);
  conn.db.images.onDelete(onDelete_Image);
}