//-----------------------------------------------
// 
//-----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
// https://spacetimedb.com/docs/tables/
export const IconImage = table(
  { name: 'icon_image', public: true },
  {
    id: t.u64().primaryKey().autoInc(),// enity id
    imageId:t.u64(),// image id
    created_at: t.timestamp(),
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------
/*
Player          PlayerState         PlayerStats         PlayerSettings
├── id     ←──  ├── player_id       ├── player_id       ├── player_id
└── name        ├── position_x      ├── total_kills     ├── audio_volume
                ├── position_y      ├── total_deaths    └── graphics_quality
                ├── velocity_x      └── play_time
                └── velocity_y

PlayerResources
├── player_id
├── health
├── max_health
├── mana
└── max_mana
*/
