//-----------------------------------------------
// TABLE Mapping
//-----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import { Coordinates } from '../types';
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

