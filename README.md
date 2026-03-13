# spacetimedb-app-map

# license: MIT

# Status: 
- Work in progress

# Information:
  This is sample project build test.

# Idea how it works:

- https://spacetimedb.com/docs/intro/faq

  For this project it will use typescript, javascript, browser and other things for web server and database.

  I can think of PostgreSQL or some database to create Doom game which someone manage to create it.

  SpaceTimeDB is Database and Server. It has the feaure of add on plugin known as module. Their idea is base on webassembly to make module for database to handle logic. The module will be publish to SpaceTimeDB server. Note it need to run the SpaceTimeDB application to import the module file as well command line to publish the module. Example NPC movement. Which mean creating a game server module base on SpaceTimeDB api as well export client module calls to able to access database without need to use or build another application. 
  
  Example server app, database app, web server and other applications to run client application. 
  
  SpaceTimeDB has schedule and event tables.
  
  As for the broswer client it need to base on server module create base to client module to build the bridge server and client to get api calls.

  The reason for the project to test. From read docs and watch video that SpacetimeDB reduce lag between server and client. As well reduce many aplications into three area. Database, web server and browser.

# Guide:
  Note SpaceTimeDB has subject to change API and incorrect coding to make code easy to development.


# server and client:

```
const user = table(
  { name: 'user', public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string().optional(),
    online: t.bool(),
  }
);
```


```js
t.identity()
```

```js
export const onConnect = spacetimedb.clientConnected(ctx => {
  const user = ctx.db.user.identity.find(ctx.sender);
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

```js
export const send_message = spacetimedb.reducer({ text: t.string() }, (ctx, { text }) => {
  validateMessage(text);
  console.info(`User ${ctx.sender}: ${text}`);
  ctx.db.message.insert({
    sender: ctx.sender,
    text,
    sent: ctx.timestamp,
  });
});
```


# set up and config

- https://spacetimedb.com/docs/functions/views
- https://spacetimedb.com/docs/functions/procedures
- 

```
spacetime start
```

```
spacetime publish --server local --module-path spacetimedb spacetime-app-map
```

```
spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb
```
- generate typescript for client