


import { DbConnection, tables } from '../module_bindings';
import { dbIcons, stateConn } from "../context";
import { addOrUpdateEntity, deleteEntity } from '../helper';

function onInsert_Icon(ctx, row){
  // console.log("insert icon:", row);
  addOrUpdateEntity(dbIcons, row);
}
function onUpdate_Icon(ctx,oldRow, newRow){
  addOrUpdateEntity(dbIcons, newRow);
}
function onDelete_Icon(ctx,row){
  deleteEntity(dbIcons, row.entityId)
}

// load icon data
export function setupDBIcon(){
  const conn = stateConn.val;
  conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      ctx.db.icons.onInsert(onInsert_Icon);
      ctx.db.icons.onUpdate(onUpdate_Icon);
      ctx.db.icons.onDelete(onDelete_Icon);
    })
    // .onError((ctx, error) => {
    //   console.error(`Subscription failed: ${error}`);
    // })
    .subscribe(tables.icons);
    // console.log(tables.icons);
}