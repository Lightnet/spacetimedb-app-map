//-----------------------------------------------
// TABLE THEME
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
// ----------------------------------------------
// theme
// ----------------------------------------------
export const theme = table(
  { name: 'theme', public: true },
  {
    id: t.identity().unique(),   // id
    text:t.string().index('btree'),       // enable search
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------

