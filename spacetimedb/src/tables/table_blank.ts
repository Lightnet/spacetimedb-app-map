//-----------------------------------------------
// TABLE BLANK
//-----------------------------------------------
// import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
// import spacetimedb from '../module';
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
//-----------------------------------------------
// 
//-----------------------------------------------