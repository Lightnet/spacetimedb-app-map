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
    const _icon = ctx.db.icon.entityId.find(entityId)
    console.log("_icon: ",_icon);
    if(!_icon){
      console.log("created icon...");
      ctx.db.icon.insert({
        id: ctx.newUuidV7().toString(),
        entityId: imageId,
        imageId: entityId,
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
  const _icon = ctx.db.icon.id.find(id)
  if(_icon){
    _icon.imageId = imageId;
    ctx.db.icon.id.update(_icon);
  }
});
// ----------------------------------------------
// DELETE ICON
// ----------------------------------------------
export const delete_icon = spacetimedb.reducer({
 id: t.string()
}, (ctx, { id }) => {
  ctx.db.icon.id.delete(id)
});