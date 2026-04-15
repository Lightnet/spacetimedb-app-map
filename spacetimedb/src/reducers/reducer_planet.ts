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
    const ranId = ctx.newUuidV7().toString();

    ctx.db.transform3d.insert({
      entityId: ranId,
      position: { x, y, z },
      quaternion: { x:0, y:0, z:0, w:0 },
      scale: { x:1, y:1, z:1 },
      parentId: undefined,
      isDirty: true,
      localMatrix: undefined,
      worldMatrix: undefined
    });

    ctx.db.planetMarkers.insert({
      entityId: ranId,
      created_at: ctx.timestamp,
      text: undefined
    });
  }
);
// ----------------------------------------------
// UPDATE PLANET MARKER
// ----------------------------------------------
export const update_planet_maker = spacetimedb.reducer(
  {id: t.string(), x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { id, x, y, z })=>{
    // Update matching an indexed column id
    const planet3d = ctx.db.planetMarkers.entityId.find(id);
    if(planet3d){
      const t3d = ctx.db.transform3d.entityId.find(id);
      if(t3d){
        t3d.position.x = x;
        t3d.position.y = y;
        t3d.position.z = z;
        ctx.db.transform3d.entityId.update(t3d);
      }
    }
});
// ----------------------------------------------
// DELETE PLANET MARKER 
// ----------------------------------------------
export const delete_planet_marker = spacetimedb.reducer(
  {id: t.string()},
  (ctx, { id })=>{
    // Delete matching an indexed column id
    ctx.db.entity.id.delete(id);
    const deleted = ctx.db.planetMarkers.entityId.delete(id);
    
    console.log(`Deleted Planet Mark: ${deleted} row(s)`);
});
//-----------------------------------------------
// 
//-----------------------------------------------