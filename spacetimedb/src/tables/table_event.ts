//-----------------------------------------------
// TABLE EVENT
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
//-----------------------------------------------
// Message Event
//-----------------------------------------------
export const messageEvent = table({
  public: true,
  event: true,
}, {
  id: t.identity(),
  text: t.string(),
  source: t.string(),
});
//-----------------------------------------------
// Damage Event
//-----------------------------------------------
export const damageEvent = table({
  public: true,
  event: true,
}, {
  entity_id: t.identity(),
  damage: t.u32(),
  source: t.string(),
});