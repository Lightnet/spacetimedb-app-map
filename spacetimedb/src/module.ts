// server api

// import { ScheduleAt, Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import { user } from './tables/table_user';
// import { userAvatar } from './tables/table_avatar_image';
// import { message } from './tables/table_message';
import { Planet, PlanetCoordinate, PlanetMarker  } from './tables/table_planet';
import { MapMarker, MapTile } from './tables/table_mapping';

// ----------------------------------------------
// SETUP TABLES
// ----------------------------------------------
const spacetimedb = schema({
  user,
  // userAvatar,
  // message,
  //Mapping Tables
  MapTile,
  MapMarker,
  // Planet Tables
  Planet,
  PlanetCoordinate,
  PlanetMarker
});


// ----------------------------------------------
// INIT MODULE
// ----------------------------------------------
export const init = spacetimedb.init(_ctx => {
  console.log("[ ====::: INIT SPACETIMEDB APP MAP :::====]");
});
// ----------------------------------------------
// ONCONNECT
// ----------------------------------------------
export const onConnect = spacetimedb.clientConnected(ctx => {
  const user = ctx.db.user.identity.find(ctx.sender);
  console.log("SENDER: ",ctx.sender);
  if (user) {
    ctx.db.user.identity.update({ ...user, online: true });
  } else {
    ctx.db.user.insert({
      identity: ctx.sender,
      name: undefined,
      online: true,
    });
  }
});
// ----------------------------------------------
// ONDISCONNECT
// ----------------------------------------------
export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  const user = ctx.db.user.identity.find(ctx.sender);
  if (user) {
    ctx.db.user.identity.update({ ...user, online: false });
  } else {
    console.warn(
      `Disconnect event for unknown user with identity ${ctx.sender}`
    );
  }
});
// ----------------------------------------------
// TASK
// ----------------------------------------------

// export const addTask = spacetimedb.reducer(
//   { text: t.string(), isDone:t.bool() },
//   (ctx, { text, isDone }) => {
//     console.info("text:", text);
//     console.info("isDone:", isDone);
//     ctx.db.task.insert({
//       id: 0n,
//       text,
//       // id: 0,
//       // sender: "",
//       // date: 0,
//       isDone
//     });
//     // console.log('add task!', text);
//     // console.warn('add task!', text);
//   }
// );

// export const deleteTask = spacetimedb.reducer(
//   { id: t.u64() },
//   (ctx, { id }) => {
//     console.log("DEL: ",id);
//     // Delete matching an indexed column id
//     const deleted = ctx.db.task.id.delete(id);
//     console.log(`Deleted ${deleted} row(s)`);
//     console.log('delete task!');
//   }
// );

// export const updateTask = spacetimedb.reducer(
//   { id: t.u64(), text: t.string(), isDone:t.bool() },
//   (ctx, { id,  text, isDone}) => {
//     console.info("DEL: ",id);
//     console.info("id:", id);
//     console.info("text:", text);
//     console.info("isDone:", isDone);

//     const task = ctx.db.task.id.find(id);
//     console.info("task: ", task);
//     if(task){
//       task.text = text;
//       task.isDone = isDone;
//       ctx.db.task.id.update(task);
//     }
//     console.info('update task!');
//   }
// );

// ----------------------------------------------
// Planet
// ----------------------------------------------

// Planet3D CREATE
// export const create_mark_planet3d = spacetimedb.reducer(
//   { x: t.f64(),y: t.f64(),z: t.f64() },
//   (ctx, { x, y, z }) => {
//     console.log("CREATE Planet x, y, z");
//     console.log(x, y, z);
//     return ctx.db.planet3d.insert({
//       id: 0n,
//       x: x,
//       y: y,
//       z: z,
//       created_at: Timestamp.now()
//     });
//   }
// );
// Planet3D UPDATE
// export const update_mark_planet3d = spacetimedb.reducer(
//   {id: t.u64(), x: t.f64(),y: t.f64(),z: t.f64() },
//   (ctx, { id, x, y, z })=>{
//     // Update matching an indexed column id
//     const planet3d = ctx.db.planet3d.id.find(id);
//     if(planet3d){
//       console.log(`UPDATE Planet Mark: ${planet3d} row(s)`);
//       planet3d.x = x;
//       planet3d.y = y;
//       planet3d.z = z;
//       ctx.db.planet3d.id.update(planet3d);
//     }
// });

// Planet3D DELETE
// export const delete_mark_planet3d = spacetimedb.reducer(
//   {id: t.u64()},
//   (ctx, { id })=>{
//     // Delete matching an indexed column id
//     const deleted = ctx.db.planet3d.id.delete(id);
//     console.log(`Deleted Planet Mark: ${deleted} row(s)`);
// });

// ----------------------------------------------
// EXPORT SPACETIMEDB
// ----------------------------------------------
export default spacetimedb;
console.log("spacetime-app-map");
