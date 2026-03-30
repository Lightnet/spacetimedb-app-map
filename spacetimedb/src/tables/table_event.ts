// 

import { Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';

const damageEvent = table({
  public: true,
  event: true,
}, {
  entity_id: t.identity(),
  damage: t.u32(),
  source: t.string(),
});

