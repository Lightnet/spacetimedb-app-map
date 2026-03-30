import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';

export const userAvatar = table(
  { name: 'user_avatar', public: true },
  {
    userId: t.u64().primaryKey(),
    mimeType: t.string(),
    data: t.array(t.u8()),  // Binary data stored inline
    uploadedAt: t.timestamp(),
  }
);