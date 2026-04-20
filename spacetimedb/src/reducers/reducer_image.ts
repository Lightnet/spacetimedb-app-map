// ----------------------------------------------
// REDUCERS IMAGE
// ----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// 
// ----------------------------------------------
export const upload_image = spacetimedb.reducer({
  name: t.string(),
  mimeType: t.string(),
  data: t.array(t.u8()),
}, (ctx, {name, mimeType, data }) => {
  const nameId = ctx.newUuidV7().toString();
  // Insert new avatar
  const _image = ctx.db.images.insert({
    id:nameId,
    name,
    mimeType,
    data,
    uploadedAt: ctx.timestamp,
  });
  // console.log("_image:", _image);
});
// ----------------------------------------------
// 
// ----------------------------------------------
export const delete_image = spacetimedb.reducer({
  id: t.string(),
}, (ctx, { id }) => {
  ctx.db.images.id.delete(id);
});
