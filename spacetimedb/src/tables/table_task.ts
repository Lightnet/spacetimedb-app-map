//-----------------------------------------------
// TABLE TASK
//-----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
//-----------------------------------------------
// TASK
//-----------------------------------------------
export const task = table(
  { name: 'task', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    // sender: t.identity(),
    // date: t.timestamp(),
    text: t.string(),
    isDone: t.bool().default(false),
    // isDone: t.bool().optional().default(false),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------