//-----------------------------------------------
// TABLE IMAGE
//-----------------------------------------------
// import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
// import spacetimedb from '../module';
//-----------------------------------------------
// 
//-----------------------------------------------
export const image = table(
  { name: 'image', public: true },
  {
    id: t.u64().autoInc().primaryKey(),
    name: t.string(),
    mimeType: t.string(),
    data: t.array(t.u8()),  // Binary data stored inline
    uploadedAt: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------