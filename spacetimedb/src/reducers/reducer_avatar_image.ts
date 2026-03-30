import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';

export const upload_avatar = spacetimedb.reducer({
  userId: t.u64(),
  mimeType: t.string(),
  data: t.array(t.u8()),
}, (ctx, { userId, mimeType, data }) => {
  // Delete existing avatar if present
  ctx.db.userAvatar.userId.delete(userId);

  // Insert new avatar
  ctx.db.userAvatar.insert({
    userId,
    mimeType,
    data,
    uploadedAt: ctx.timestamp,
  });
});