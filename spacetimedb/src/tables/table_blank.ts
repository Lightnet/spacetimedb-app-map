//-----------------------------------------------
// TABLE BLANK
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
//-----------------------------------------------
// 
//-----------------------------------------------
export const blank = table(
  { name: 'blank', public: true },
  {
    id: t.u64().primaryKey().autoInc(),     // id
    text:t.string().index('btree'),         // enable search
    created_at: t.timestamp(),              // time stamp
  }
);