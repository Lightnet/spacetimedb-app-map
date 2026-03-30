// mapping

// import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import { Coordinates } from '../types';
// import spacetimedb from '../module';

// https://spacetimedb.com/docs/tables/

//-----------------------------------------------
// MAP TILE
//-----------------------------------------------
export const MapTile = table(
  { name: 'map_tile', public: true },
  {
    // owner: t.identity(),
    id: t.u64().primaryKey().autoInc(),
    position: Coordinates,
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// MAP MARK
//-----------------------------------------------
export const MapMarker = table(
  { name: 'map_marker', public: true },
  {
    // owner: t.identity(),
    id: t.u64().primaryKey().autoInc(),
    position: Coordinates,
    created_at: t.timestamp(),
  }
);

export const Icon2D = table(
  { name: 'icon_2d', public: true },
  {
    // sender: t.identity(),
    // owner: t.identity(),
    id: t.u64().primaryKey().autoInc(),
    icon: t.string().default('None'),
    created_at: t.timestamp(),
  }
);