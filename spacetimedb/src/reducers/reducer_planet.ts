//-----------------------------------------------
// REDUCERS PLANET
//-----------------------------------------------
// import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// import { Coordinates } from '../types';
// ----------------------------------------------
// Planet
// ----------------------------------------------
// ----------------------------------------------
// CREATE PLANET MARKER
// ----------------------------------------------
// Planet3D CREATE
export const create_planet_marker = spacetimedb.reducer(
  { x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { x, y, z }) => {
    console.log("CREATE Planet x, y, z");
    console.log(x, y, z);
    return ctx.db.PlanetMarker.insert({
      id: 0n,
      position: {x, y, z},
      created_at: ctx.timestamp
    });
  }
);
// ----------------------------------------------
// UPDATE PLANET MARKER
// ----------------------------------------------
export const update_planet_maker = spacetimedb.reducer(
  {id: t.u64(), x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { id, x, y, z })=>{
    // Update matching an indexed column id
    const planet3d = ctx.db.PlanetMarker.id.find(id);
    if(planet3d){
      console.log(`UPDATE Planet Mark: ${planet3d} row(s)`);
      planet3d.position.x = x;
      planet3d.position.y = y;
      planet3d.position.z = z;

      ctx.db.Planet.id.update(planet3d);
    }
});
// ----------------------------------------------
// DELETE PLANET MARKER 
// ----------------------------------------------
export const delete_planet_marker = spacetimedb.reducer(
  {id: t.u64()},
  (ctx, { id })=>{
    // Delete matching an indexed column id
    const deleted = ctx.db.PlanetMarker.id.delete(id);
    console.log(`Deleted Planet Mark: ${deleted} row(s)`);
});
//-----------------------------------------------
// 
//-----------------------------------------------