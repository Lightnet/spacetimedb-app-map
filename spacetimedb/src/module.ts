//-----------------------------------------------
// server api
//-----------------------------------------------
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
// EXPORT SPACETIMEDB
// ----------------------------------------------
export default spacetimedb;
console.log("spacetime-app-map");
