//-----------------------------------------------
// REDUCERS MAPPING
//-----------------------------------------------
import { t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
import { computeLocalMatrix3D } from '../helpers/helper_transform3d';
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
    const ranId = ctx.newUuidV7().toString();

    ctx.db.entity.insert({
      id: ranId,
    });

    const safePosition = { x, y, z };
    const safeQuaternion = { x: 0, y: 0, z: 0, w: 1 };
    const safeScale = { x: 1, y: 1, z: 1 };

    const localMat = computeLocalMatrix3D({
      position: safePosition,
      quaternion: safeQuaternion,
      scale: safeScale,
    });

    ctx.db.transform3d.insert({
      entityId: ranId,
      position: {x,y,z},
      quaternion: {x:0,y:0,z:0,w:1},
      scale: {x:1,y:1,z:1},
      parentId: undefined,
      isDirty: false,
      localMatrix: localMat,
      worldMatrix: undefined
    });

    ctx.db.mapTiles.insert({
      created_at: ctx.timestamp,
      entityId: ranId
    });
  }
);
// ----------------------------------------------
// UPDATE MAP TILE
// ----------------------------------------------
export const update_map_tile = spacetimedb.reducer(
  { id:t.string(), x: t.f64(), y: t.f64(), z: t.f64() },
  (ctx, {id, x, y, z }) => {
    
    console.log(x, y, z);
    const maptile = ctx.db.mapTiles.entityId.find(id);
    if(!maptile) return;
    const t3d = ctx.db.transform3d.entityId.find(id);
    if(t3d){
      t3d.position.x = x;
      t3d.position.y = y;
      t3d.position.z = z;
      ctx.db.transform3d.entityId.update(t3d);
    }
  }
);
// ----------------------------------------------
// DELETE MAP TILE
// ----------------------------------------------
export const delete_map_tile = spacetimedb.reducer(
  { id: t.string()},
  (ctx, { id }) => {
    console.log("Delete Map Tile id:", id);
    ctx.db.entity.id.delete(id);
    ctx.db.transform3d.entityId.delete(id);
    ctx.db.mapTiles.entityId.delete(id);
  }
);
// ----------------------------------------------
// CREATE MAP MARK
// ----------------------------------------------
export const create_map_marker = spacetimedb.reducer(
  { x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { x, y, z }) => {
    console.log("CREATE Map Marker x, y, z", x, ": ", y, ": ",z);

    const ranId = ctx.newUuidV7().toString();

    ctx.db.entity.insert({
      id: ranId,
    });

    const safePosition = { x, y, z };
    const safeQuaternion = { x: 0, y: 0, z: 0, w: 1 };
    const safeScale = { x: 1, y: 1, z: 1 };

    const localMat = computeLocalMatrix3D({
      position: safePosition,
      quaternion: safeQuaternion,
      scale: safeScale,
    });

    ctx.db.transform3d.insert({
      entityId: ranId,
      position: {x,y,z},
      quaternion: {x:0,y:0,z:0,w:1},
      scale: {x:1,y:1,z:1},
      parentId: undefined,
      isDirty: false,
      localMatrix: localMat,
      worldMatrix: undefined
    });

    return ctx.db.mapMarkers.insert({
      created_at: ctx.timestamp,
      entityId: ranId
    });
  }
);
// ----------------------------------------------
// UPDATE MAP MARK
// ----------------------------------------------
export const update_map_marker = spacetimedb.reducer(
  {id: t.string(), x: t.f64(),y: t.f64(),z: t.f64() },
  (ctx, { id, x, y, z }) => {
    // console.log("Update Map Marker x, y, z", x, ": ", y, ": ",z);
    // console.log("id: ",id);
    const marker = ctx.db.mapMarkers.entityId.find(id);
    // console.log("found marker??",marker)
    if(marker){
      const t3d = ctx.db.transform3d.entityId.find(id);
      // console.log("found???",t3d)
      if(t3d){
        // console.log("update???")
        t3d.position.x = x;
        t3d.position.y = y;
        t3d.position.z = z;
        ctx.db.transform3d.entityId.update(t3d);
      }
    }
  }
);
// ----------------------------------------------
// DELETE MAP MARK
// ----------------------------------------------
export const delete_map_marker = spacetimedb.reducer(
  { id: t.string()},
  (ctx, { id}) => {
    console.warn("[ DELETE ] Map Marker id:", id);
    ctx.db.entity.id.delete(id)
    ctx.db.transform3d.entityId.delete(id);
    ctx.db.mapMarkers.entityId.delete(id);
  }
);
// ----------------------------------------------
// 
// ----------------------------------------------