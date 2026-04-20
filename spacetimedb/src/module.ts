//-----------------------------------------------
// server api
//-----------------------------------------------
// import { ScheduleAt, Timestamp } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import { users } from './tables/table_user';
// import { userAvatar } from './tables/table_avatar_image';
// import { message } from './tables/table_message';
import { planets, planetCoordinates, planetMarkers  } from './tables/table_planet';
import { images } from './tables/table_image';
import { icons } from './tables/table_icon';
import { text } from './tables/table_text';
import { entity } from './tables/table_entity';
import { transform3d } from './tables/table_transform3d';
import { mapMarkers, mapTiles } from './tables/table_mapping';
// ----------------------------------------------
// SETUP TABLES
// ----------------------------------------------
const spacetimedb = schema({
  users,
  images,
  icons,
  text,
  // ENTITY
  entity,
  transform3d,
  //Mapping Tables
  mapTiles,
  mapMarkers,
  // Planet Tables
  planets,
  planetCoordinates,
  planetMarkers
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
  const user = ctx.db.users.identity.find(ctx.sender);
  // console.log("SENDER: ",ctx.sender);
  if (user) {
    ctx.db.users.identity.update({ ...user, online: true });
  } else {
    ctx.db.users.insert({
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
  const user = ctx.db.users.identity.find(ctx.sender);
  if (user) {
    ctx.db.users.identity.update({ ...user, online: false });
  } else {
    console.warn(
      `Disconnect event for unknown user with identity ${ctx.sender}`
    );
  }
});
// ----------------------------------------------
// EXPORT SPACETIMEDB
// ----------------------------------------------
export default spacetimedb;
console.log("spacetime-app-map");
