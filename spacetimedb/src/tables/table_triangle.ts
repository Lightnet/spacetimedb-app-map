//-----------------------------------------------
// TABLE BLANK
//-----------------------------------------------
import { table, t } from 'spacetimedb/server';
import { Vect3 } from '../types/types';
//-----------------------------------------------
// 
//-----------------------------------------------
export const triangles = table(
  { name: 'triangles', public: true },
  {
    entityId: t.string().primaryKey(),     // id
    v0:Vect3,         // Vector3
    v1:Vect3,         // Vector3
    v2:Vect3,         // Vector3
    color:t.string().optional(),
    created_at: t.timestamp(),              // time stamp
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------