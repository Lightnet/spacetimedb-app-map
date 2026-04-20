//-----------------------------------------------
// 
//-----------------------------------------------
import * as THREE from 'three';
import { DbConnection, tables } from '../module_bindings';
import { dbIcons, dbImages, dbMapMarkers, dbMapTiles, dbTransform3ds, stateConn, stateGrids, stateMarkers, stateScene, stateSelectEntityId } from "../context";
import { addOrUpdateEntity, deleteEntity } from '../helper';
import { create_model_marker, create_tile } from '../render';

function update_transform3d_position(mesh, row){
  mesh.position.set(row.position.x, row.position.y, row.position.z);
}

function check_icon_make(mesh, row){
  // console.log("test");
  const icon = dbIcons.val.get(row.entityId);
  
  if(icon){
    console.log(icon);
    console.log("found icon data...");
    const image = dbImages.val.get(icon.imageId);
    if(image){
      console.log("found Image:");

      const blob = new Blob([image.data], { type: "image/png" }); 
      const tempUrl = URL.createObjectURL(blob);
      // const tempUrl = URL.createObjectURL(image.data);// nope i think
      // const tmp = img({width:64, height:64, onclick:()=>selectImageId(image.id)});
      // tmp.src = tempUrl;
      const loader = new THREE.TextureLoader();
      loader.load(tempUrl, (texture) => {
        // Use a PlaneGeometry to display the 2D image in 3D space
        const geometry = new THREE.PlaneGeometry(5, 5); 
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        const scene = stateScene.val;
        const marker = scene.children.find(r=>r.userData?.row?.entityId == row.entityId)

        if(marker){
          marker.add(mesh);

          const offset = new THREE.Vector3(0, 9, 0);
          // mesh.position.copy(marker.worldToLocal(offset.clone().add(marker.getWorldPosition(new THREE.Vector3()))));
          mesh.position.set(0,16,0);

          // 1. Get the marker's current world position
          // const markerWorldPos = new THREE.Vector3();
          // marker.getWorldPosition(markerWorldPos);   // or .setFromMatrixPosition(marker.matrixWorld)
          // // 2. Add your desired world offset (0, 9, 0)
          // const desiredWorldPos = markerWorldPos.clone().add(new THREE.Vector3(0, 9, 0));
          // // 3. Convert that desired world position into the marker's LOCAL space
          // const localPos = marker.worldToLocal(desiredWorldPos.clone());
          // // 4. Apply it to the mesh
          // mesh.position.copy(localPos);
          // // mesh.updateMatrixWorld(true);

        }
        // Optional: Clean up the blob URL after the texture is uploaded to GPU
        // URL.revokeObjectURL(tempUrl); 
      });
    }
  }
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
    check_icon_make(_marker, row)
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