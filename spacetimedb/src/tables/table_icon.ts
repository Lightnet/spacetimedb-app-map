//-----------------------------------------------
// TABLE 
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';

export const icon = table(
  { name: 'icon', public: true },
  {
    id: t.string().primaryKey(),        // id
    entityId:t.string().unique(),       // entity id
    imageId:t.string(),                 // image id
    created_at: t.timestamp(),
  }
);