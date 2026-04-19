//-----------------------------------------------
// 
//-----------------------------------------------
import { DbConnection, tables } from '../module_bindings';
import { dbEntities, stateConn } from "../context";

function addOrUpdateEntity(ent) {
  if (!ent || !ent.id) return;
  const newMap = new Map(dbEntities.val);           // get current and create copy
  newMap.set(ent.id, ent);
  dbEntities.val = newMap;                  // assign new Map → triggers update
}
function deleteEntity(id) {
  if (!id) return;
  // Create new Map without the item
  const newMap = new Map(dbEntities.val);
  newMap.delete(id);
  // Update the state (this is what makes VanJS detect the change)
  dbEntities.val = newMap;
}
function onInsert_Entity(ctx, row){
  // console.log("insert entity:", row);
  addOrUpdateEntity(row);
}
function onUpdate_Entity(ctx,oldRow, newRow){
  addOrUpdateEntity(newRow);
}
function onDelete_Entity(ctx,row){
  deleteEntity(row.id)
}
export function setupDBEntity(){
  const conn = stateConn.val;
  conn
    .subscriptionBuilder()
    .subscribe(tables.entity);
  conn.db.entity.onInsert(onInsert_Entity);
  conn.db.entity.onUpdate(onUpdate_Entity);
  conn.db.entity.onDelete(onDelete_Entity);
}