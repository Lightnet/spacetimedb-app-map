// ----------------------------------------------
// REDUCERS ENTITY
// ----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// CREATE ICON
// ----------------------------------------------
export const create_icon = spacetimedb.reducer({
 imageId: t.u64(),
 entityId: t.u64(),
}, (ctx, { imageId, entityId }) => {
  console.log("create icon...")
    const _icon = ctx.db.icon.entityId.find(entityId)
    console.log("_icon: ",_icon);
    if(!_icon){
      console.log("created icon...");
      ctx.db.icon.insert({
        id: 0n,
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
  id: t.u64(),
  imageId: t.u64(),
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
 id: t.u64()
}, (ctx, { id }) => {
  ctx.db.icon.id.delete(id)
});