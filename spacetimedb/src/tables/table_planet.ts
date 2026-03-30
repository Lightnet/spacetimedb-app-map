//-----------------------------------------------
// Table Planet  
//-----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import { Coordinates } from '../types';
// ----------------------------------------------
// Planet
// ----------------------------------------------
export const Planet = table(
  { name: 'planet', public: true },
  {
    // sender: t.identity(),
    // owner: t.identity(),
    id: t.u64().primaryKey().autoInc(),
    // name: t.string().default(''),
    // information: t.string().default(''),
    position: Coordinates,
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------
export const PlanetCoordinate = table(
  { name: 'planet_coordinate', public: true },
  {
    planetId: t.u64(),
    position: Coordinates,
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------
export const PlanetMarker = table(
  { name: 'planet_marker', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    position: Coordinates,
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------
