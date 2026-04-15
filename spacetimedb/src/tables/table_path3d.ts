//-----------------------------------------------
// TABLE 
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';

export const path3d = table(
  { name: 'path3d', public: true },
  {
    entityId: t.string().primaryKey(),
    created_at: t.timestamp(),
  }
);
