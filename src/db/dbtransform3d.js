//-----------------------------------------------
// 
//-----------------------------------------------
import { DbConnection, tables } from '../module_bindings';
import { dbMapMarkers, dbMapTiles, dbTransform3ds, stateConn, stateGrids, stateMarkers, stateScene, stateSelectEntityId } from "../context";
import { addOrUpdateEntity, deleteEntity } from '../helper';
import { create_model_marker, create_tile } from '../render';

function update_transform3d_position(mesh, row){
  mesh.position.set(row.position.x, row.position.y, row.position.z);
}

function create_model_check(row){
  const mapTile = dbMapTiles.val.get(row.entityId);
  if(mapTile){
    // console.log("found map tile:", mapTile);
    const _tileMap = create_tile();
    _tileMap.userData.row = row;
    const scene = stateScene.val;
    update_transform3d_position(_tileMap, row);
    scene.add(_tileMap);
    stateGrids.val.push(_tileMap)
  }
  const mapMarker = dbMapMarkers.val.get(row.entityId);
  if(mapMarker){
    const _marker = create_model_marker();
    update_transform3d_position(_marker, row);
    _marker.userData.row = row;
    const scene = stateScene.val;
    scene.add(_marker);
    stateMarkers.val.push(_marker);
  }
}

function update_model_transform3d(row){
  const scene = stateScene.val;
  const smesh = scene.children.find(r=>r.userData?.row?.entityId == row.entityId);
  if(smesh){
    smesh.position.set(
      row.position.x,
      row.position.y,
      row.position.z
    )
  }
}

function onDelete_mesh(row){
  const scene = stateScene.val;
  const mesh = scene.children.find(r=>r.userData?.row?.entityId == row.entityId)
  if(mesh){
    scene.remove(mesh);
  }
}

function onInsert_Entity(ctx, row){
  // console.log("insert transform3d:", row);
  addOrUpdateEntity(dbTransform3ds,row);
  create_model_check(row);
}
function onUpdate_Entity(ctx,oldRow, newRow){
  addOrUpdateEntity(dbTransform3ds, newRow);
  if(stateSelectEntityId.val != newRow.entityId){
    update_model_transform3d(newRow)
  }
  
}
function onDelete_Entity(ctx,row){
  deleteEntity(dbTransform3ds, row.entityId);
  onDelete_mesh(row);
}
export function setupDBTransform3D(){
  const conn = stateConn.val;
  conn
    .subscriptionBuilder()
    .subscribe(tables.transform3d);
  conn.db.transform3d.onInsert(onInsert_Entity);
  conn.db.transform3d.onUpdate(onUpdate_Entity);
  conn.db.transform3d.onDelete(onDelete_Entity);
}