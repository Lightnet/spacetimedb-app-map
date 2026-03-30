// 

import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// Planet
// ----------------------------------------------

// Planet3D CREATE
export const create_mark_planet3d = spacetimedb.reducer(
  { x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { x, y, z }) => {
    console.log("CREATE Planet x, y, z");
    console.log(x, y, z);
    return ctx.db.planet3d.insert({
      id: 0n,
      x: x,
      y: y,
      z: z,
      created_at: Timestamp.now()
    });
  }
);

