//-----------------------------------------------
// TABLE CONFIG
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
import { Vect3 } from '../types/types';
// ----------------------------------------------
// config
// ----------------------------------------------
export const config = table(
  { name: 'config', public: true },
  {
    id: t.identity().unique(),   // id
    text:t.string().index('btree'),       // enable search
    grid_size:t.f32().default(32),
    is_snap:t.bool().default(true),
    marker_offset:Vect3.default({x:0,y:8,z:0}),
    created_at: t.timestamp(),
  }
);