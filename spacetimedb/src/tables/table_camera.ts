//-----------------------------------------------
// TABLE CONFIG
//-----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
// ----------------------------------------------
// config
// ----------------------------------------------
export const perspectiveCameras = table(
  { name: 'perspective_cameras', public: true },
  {
    entityId: t.string().unique(),   // id
    fov: t.f32().default(50),
    aspect: t.f32().default(1),
    near: t.f32().default(0.1),
    far: t.f32().default(2000),
    created_at: t.timestamp(),
  }
);