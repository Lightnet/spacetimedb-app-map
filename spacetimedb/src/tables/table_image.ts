//-----------------------------------------------
// TABLE IMAGE
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
//-----------------------------------------------
// 
//-----------------------------------------------
export const images = table(
  { name: 'images', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    mimeType: t.string(),
    data: t.array(t.u8()),  // Binary data stored inline
    uploadedAt: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------