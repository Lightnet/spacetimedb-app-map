# spacetimedb-app-map

# License: MIT

# Programs:
- spacetimedb 2.1.0

# npm:
- vanjs-core 1.6.0
- vanjs-ui
- three 0.183.2
- spacetimedb 2.1.0
- vite 8.0.0
- tweakpane 4.0.5

# Status:
- Work in progress
- need to rework that use transform3d
- need work on triangle.

# Information:
  This is prototype project build test for SpaceTimeDB. File change is subject to change and unstable currently.
  
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
- terrain editor
- voxel
- mesh table with triangle.

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
```
spacetime sql --server local spacetime-app-map "SELECT * FROM icon"
```

## Notes:
- Note the server module must match on export client module else it will error when api calls.

# Examples:
  Work in progress.

# planet.html ( broken ):
  Work in progress.
- longitude, latitude
- [x] latLonToVector3
- [x] vector3ToLatLon
- [x] mouse to latitude,longitude on sphere
- [x] place marker base on latitude, longitude to 3d point
- [x] drag marker
- [ ] orbit test

# index:
- mapping.html ( broken ):
  Work in progress. Trying to keep it simple.
- [ ] config
- [ ] Grid Helper
- [ ] image
    - [x] upload
    - [x] list
    - [ ] delete
- [ ] icon
    - [x] create
        - [x] marker
    - [ ] update
    - [ ] delete
    - [ ] size (need to scale when camera zoom in and out?)
- [ ] ui
    - [x] Markers list
    - [x] Tile list
- [ ] tile
    - [x] add
    - [x] delete
    - [ ] update
- [ ] marker
    - [x] option to add icon
    - [x] add
    - [x] delete
    - [x] update
      - [x] drag marker
    - [ ] icon
      - [ ] offset

## Map marker:
  Work in progress. Testing the offset position build.