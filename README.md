# spacetimedb-app-map

# License: MIT

# Programs:
- spacetimedb 2.1.0

# npm:
- vanjs 1.6.0 (refs)
- three 0.183.2
- spacetimedb 2.1.0
- vite 8.0.0

# Status:
- Work in progress

# Information:
  This is sample project build test. Note SpaceTimeDB has subject to change API and incorrect coding while in development.

  Building the prototype mapping tool to able to creae tile grid and marker to create, update and delete markers in the world in 2.5 world.

# Why SpacetimeDB?:
  Using the SpaceTimeDB might be over killed just for mapping tool. But what if the mapping is too big for browser to load many entities. Which can lag. It can be filter down by layers or range.

## Ideas:
- timer and postion when monster spawn.
- event area
- measure distance which need to config base on image.
- patrol, route
- underground
- level
- timer location
- icons location
- monster location
- boss location

# Set Up and Config
  Required SpaceTimeDB install to local machine or container. As well Bun install. WHich need to compile and build server and client.

  SpaceTimeDB set up for server module, database application and command line. Which is all one package.
## start app
```
spacetime start
```
- start database and server application.
- note it need to run on terminal.

## SpaceTimeDB Dev:
  This command will simalar to Bun js hot reload.
```
spacetime dev --server local
```
  Note they must in current project root folder to work.

# Publish module:
```
spacetime publish --server local --module-path spacetimedb spacetime-app-map
```
- run spacetime to push module app
- This support Typescript to push to module to run server for clients to access web socket.
# App logs:
```
spacetime logs -s local -f spacetime-app-map 
```
- Note this run another terminal to access spacetimedb client to log for database name.
- log datbase spacetime-app-map debug 

# Export client module:
```
spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb
```
- generate typescript for client
- note this export typescript.
- it can be use for normal.

# web server:
  Using the vite js for easy to handle typescript and javacript browser support. It only to use to run static files.
```
bun run dev
```
# SQL:
  To manual check sql table names.
```
spacetime sql --server local spacetime-app-map "SELECT * FROM user"
```
```
spacetime sql --server local spacetime-app-map "SELECT * FROM planet"
```
```
spacetime sql --server local spacetime-app-map "SELECT * FROM map_mark"
```
```
spacetime sql --server local spacetime-app-map "SELECT * FROM map_tile"
```

## Notes:
- Note the server module must match on export client module else it will error when api calls.

# Examples:
  Work in progress.

# planet.html:
  Work in progress.
- longitude, latitude
- [ ] latLonToVector3
- [ ] vector3ToLatLon
- [ ] mouse to latitude,longitude on sphere
- [ ] place marker base on latitude, longitude to 3d point
- [ ] orbit test

# mapping.html:
  Work in progress. Trying to keep it simple.
- [ ] Grid Helper
- [ ] ui
    - [x] markers list
    - [x] grid list
- [ ] grid
    - [x] add
    - [x] delete
    - [ ]update
- [ ] marker
    - [x] add
    - [x] delete
    - [x]update
        - drag marker