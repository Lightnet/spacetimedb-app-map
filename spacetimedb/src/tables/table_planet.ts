//-----------------------------------------------
// TABLE Planet  
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
// ----------------------------------------------
// PLANET
// ----------------------------------------------
export const planets = table(
  { name: 'planets', public: true },
  {
    entityId: t.string().primaryKey(),
    name: t.string().optional(),
    information: t.string().optional(),
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// PLANET COORDINATE
//-----------------------------------------------
export const planetCoordinates = table(
  { name: 'planet_coordinates', public: true },
  {
    entityId: t.string().primaryKey(),
    text:t.string().optional(),
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// PLANET MARKER
//-----------------------------------------------
export const planetMarkers = table(
  { name: 'planet_markers', public: true },
  {
    entityId: t.string().primaryKey(),
    text:t.string().optional(),
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------
