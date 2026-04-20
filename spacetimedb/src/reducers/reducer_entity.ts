// ----------------------------------------------
// REDUCERS ENTITY
// ----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// CREATE ICON
// ----------------------------------------------
export const create_icon = spacetimedb.reducer({
 imageId: t.string(),
 entityId: t.string(),
}, (ctx, { imageId, entityId }) => {
  console.log("create icon...")
  const _icon = ctx.db.icons.entityId.find(entityId)
  console.log("_icon: ",_icon);
  if(!_icon){
    console.log("created icon...");
    ctx.db.icons.insert({
      id: ctx.newUuidV7().toString(),
      entityId: entityId,
      imageId: imageId,
      created_at: ctx.timestamp
    });
  }else{
    console.log("icon exist!");
  }
});
// ----------------------------------------------
// UPDATE ICON
// update entity icon by id
// ----------------------------------------------
export const update_icon = spacetimedb.reducer({
  id: t.string(),
  imageId: t.string(),
}, (ctx, { id, imageId }) => {
  const _icon = ctx.db.icons.id.find(id)
  if(_icon){
    _icon.imageId = imageId;
    ctx.db.icons.id.update(_icon);
  }
});
// ----------------------------------------------
// DELETE ICON
// ----------------------------------------------
export const delete_icon = spacetimedb.reducer({
 id: t.string()
}, (ctx, { id }) => {
  ctx.db.icons.id.delete(id)
});