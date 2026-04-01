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
  // Insert new avatar
  const _image = ctx.db.image.insert({
    id:0n,
    name,
    mimeType,
    data,
    uploadedAt: ctx.timestamp,
  });
  console.log("_image:", _image);
});
// ----------------------------------------------
// 
// ----------------------------------------------
export const upload_text_image = spacetimedb.reducer({
  mimeType: t.string(),
  data: t.array(t.u8()),
}, (ctx, { mimeType, data }) => {
  // Delete existing avatar if present
  // ctx.db.userAvatar.userId.delete(userId);
  // // Insert new avatar
  // ctx.db.userAvatar.insert({
  //   userId,
  //   mimeType,
  //   data,
  //   uploadedAt: ctx.timestamp,
  // });
});
