//-----------------------------------------------
// TABLE TEST
//-----------------------------------------------
// import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
// import spacetimedb from '../module';
// ----------------------------------------------
// Test
// ----------------------------------------------
export const test = table(
  { name: 'test', public: true },
  {
    id: t.u64().primaryKey().autoInc(),   // id
    text:t.string().index('btree'),       // enable search
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------
