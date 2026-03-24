# spacetimedb-app-map

# License: MIT

# Programs:
- spacetimedb 2.0.5

# npm:
- vanjs 1.6.0 (refs)
- three 0.183.2
- spacetimedb 2.0.4
- vite 8.0.0

# Status:
- Work in progress

# Information:
  This is sample project build test. Note SpaceTimeDB has subject to change API and incorrect coding while in development.

  Working on game world mapping without game play. It just simple mapping tool to able to store map and location markers to test.

  So it would be just mapping editor tool.

  Sample of the planet marker, tile map 2.5D and other tests. 

## auth, user and token:
  Since access to SpaceTimeDB by using the websocket. Which create anonymous user token by default since there no login password. It will auto generated token and Identity. It would need browser to store by local storage since it using the web socket to access database and server module.

  You can think of browser client without user account check and default to guest access.

## Database Names:
- https://spacetimedb.com/docs/databases
When you publish a module, you give the database a name. Database names must match the regex /^[a-z0-9]+(-[a-z0-9]+)*$/, i.e. only lowercase ASCII letters and numbers, separated by dashes.

```
my-game-server
chat-app-production
test123
```

# SpaceTimeDB script:
  Note that server module need to push to SpaceTimeDB app and export client module.

```js
// server
const user = table(
  { name: 'user', public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string().optional(),
    online: t.bool(),
  }
);
```
- public is expose for public access.

```js
// server
export const set_name = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
  // console.info("Name: ",name);
  validateName(name);
  const user = ctx.db.user.identity.find(ctx.sender);// client id
  if (!user) {
    throw new SenderError('Cannot set name for unknown user');
  }
  ctx.db.user.identity.update({ ...user, name });
});
```

```js
// server
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
```
- check if user exist it will update else create new user client

```js
//... client
function apply_user(ctx){
  // console.log("apply");
  console.log(`Ready with ${ctx.db.user.count()} users`);
  // console.log(ctx);
}
//...

const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem('auth_token') || undefined)
  .onConnect((conn, identity, token) => {
  //...
    conn
      .subscriptionBuilder()
        .onApplied((ctx) => apply_user(ctx))
        .onError((ctx, error) => {
          console.error(`Subscription failed: ${error}`);
        })
        .subscribe(tables.user);
  //...
  })
```
- This will listen user table.


# Set Up and Config
- https://spacetimedb.com/docs/functions/views
- https://spacetimedb.com/docs/functions/procedures
- 

  SpaceTimeDB set up for server and database application.
## start app
```
spacetime start
```
- start database and server application.
- note it need to run on terminal.
## Publish module:
```
spacetime publish --server local --module-path spacetimedb spacetime-app-map
```
- run spacetime to push module app
- This support Typescript to push to module to run server for clients to access web socket.
## App logs:
```
spacetime logs -s local -f spacetime-app-map 
```
- Note this run another terminal to access spacetimedb client to log for database name.
- log datbase spacetime-app-map debug 

## Export client module:
```
spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb
```
- generate typescript for client
- note this export typescript.
- it can be use for normal.

## web server:
  Using the vite js for easy to handle typescript and javacript browser support. It only to use to run static files.
```
bun run dev
```
## SQL:
  To manual check sql table names.
```
spacetime sql --server local spacetime-app-map "SELECT * FROM user"
```

```
spacetime sql --server local spacetime-app-map "SELECT * FROM message"
```

```
spacetime sql --server local spacetime-app-map "SELECT * FROM task"
```


```
spacetime sql --server local spacetime-app-map "SELECT * FROM reminder"
```

```
spacetime sql --server local spacetime-app-map "SELECT * FROM planet3d"
```



## Notes:
- Note the server module must match on export client module else it will error when api calls.


# Examples:
## schedules.html:
- schedule
  Testing the one time timer to trigger message.
- event
  Testing the event damage example from spacetimedb docs


# planet.html:
- longitude
- latitude
- latLonToVector3
- vector3ToLatLon
- mouse to latitude,longitude on sphere
- place marker base on latitude,longitude to 3d point
- work in progress.

# chat:
  Work in progress.
- set name
- send message
- ui

# task:
- add task
- remove task
- update task

# map3D:
- place tile
- place marker