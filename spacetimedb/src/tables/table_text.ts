//-----------------------------------------------
// TABLE 
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';

export const text = table(
  { name: 'text', public: true },
  {
    entityId: t.string().primaryKey(),   // id
    text:t.u64(),                     
    created_at: t.timestamp(),
  }
);