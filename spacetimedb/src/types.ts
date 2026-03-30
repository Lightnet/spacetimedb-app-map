
import { table, t } from 'spacetimedb/server';

// Define a nested object type for coordinates
export const Coordinates = t.object('Coordinates', {
  x: t.f64(),
  y: t.f64(),
  z: t.f64(),
});


