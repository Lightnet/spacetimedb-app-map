//-----------------------------------------------
// import { Timestamp } from 'spacetimedb';
//-----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// Mapping
// ----------------------------------------------

// ----------------------------------------------
// CREATE MAP TILE
// ----------------------------------------------
export const create_map_tile = spacetimedb.reducer(
  { x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { x, y, z }) => {
    console.log("CREATE Map Maker x, y, z", x, " :", y, " :", z);
    return ctx.db.MapTile.insert({
      position: {x:x,y:y,z:z},
      id: 0n,
      created_at: ctx.timestamp
    });
  }
);
// ----------------------------------------------
// UPDATE MAP TILE
// ----------------------------------------------
export const update_map_tile = spacetimedb.reducer(
  { x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { x, y, z }) => {
    console.log("CREATE Planet x, y, z");
    console.log(x, y, z);
    // return ctx.db.MapTile.insert({
    //   position: {x:0,y:0,z:0},
    //   id: 0n,
    //   created_at: ctx.timestamp
    // });
  }
);
// ----------------------------------------------
// DELETE MAP TILE
// ----------------------------------------------
export const delete_map_tile = spacetimedb.reducer(
  { id: t.u64()},
  (ctx, { id }) => {
    console.log("Delete Map Tile id:", id);
    ctx.db.MapTile.id.delete(id);
  }
);
// ----------------------------------------------
// CREATE MAP MARK
// ----------------------------------------------
export const create_map_marker = spacetimedb.reducer(
  { x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { x, y, z }) => {
    console.log("CREATE Map Marker x, y, z", x, ": ", y, ": ",z);
    return ctx.db.MapMarker.insert({
      position: {x, y, z},
      id: 0n,
      created_at: ctx.timestamp
    });
  }
);

// ----------------------------------------------
// UPDATE MAP MARK
// ----------------------------------------------
export const update_map_marker = spacetimedb.reducer(
  {id: t.u64(), x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { id, x, y, z }) => {
    console.log("Update Map Marker x, y, z", x, ": ", y, ": ",z);

    const marker = ctx.db.MapMarker.id.find(id);

    if(marker){
      marker.position.x = x;
      marker.position.y = y;
      marker.position.z = z;
      ctx.db.MapMarker.id.update(marker);
    }
    
  }
);
// ----------------------------------------------
// DELETE MAP MARK
// ----------------------------------------------
export const delete_map_marker = spacetimedb.reducer(
  { id: t.u64()},
  (ctx, { id}) => {

    console.warn("[ DELETE ] Map Marker id:", id);
    ctx.db.MapMarker.id.delete(id);
  }
);
// ----------------------------------------------
// 
// ----------------------------------------------