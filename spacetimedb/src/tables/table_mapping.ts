//-----------------------------------------------
// TABLE Mapping
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
//-----------------------------------------------
// MAP TILE
//-----------------------------------------------
export const mapTiles = table(
  { name: 'map_tiles', public: true },
  {
    entityId: t.string().primaryKey(),
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// MAP MARK
//-----------------------------------------------
export const mapMarkers = table(
  { name: 'map_markers', public: true },
  {
    entityId: t.string().primaryKey(),
    created_at: t.timestamp(),
  }
);

