

import * as THREE from 'three';
import { DbConnection, tables } from '../module_bindings';
import { dbIcons, dbImages, dbMapMarkers, dbTransform3ds, stateConn, stateScene } from "../context";
import { addOrUpdateEntity, deleteEntity } from '../helper';

export function check_icon_make(mesh, row){
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
          mesh.userData.type="ICON";
          mesh.userData.entityId=row.entityId;

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

function check_marker_create_icon(row){
  console.log(row);
  const marker = dbMapMarkers.val.get(row.entityId);
  const transform = dbTransform3ds.val.get(row.entityId);
  console.log("marker: ", marker);
  console.log("transform: ", transform);
  if(marker && transform){
    console.log("found maker...");
    const scene = stateScene.val;

    for(const node of scene.children){
      if(node.userData?.entityId == row.entityId){
        check_icon_make(node, row);
      }
    }

  }
}


function onInsert_Icon(ctx, row){
  // console.log("insert icon:", row);
  addOrUpdateEntity(dbIcons, row);
  //check if icon or there new icon to create.
  check_marker_create_icon(row);
}
function onUpdate_Icon(ctx,oldRow, newRow){
  addOrUpdateEntity(dbIcons, newRow);
}
function onDelete_Icon(ctx,row){
  deleteEntity(dbIcons, row.entityId);
  console.log(row);
  const scene = stateScene.val;
  scene.traverse(function (node) {
    if(node.userData?.type=="ICON"){
      if(node.userData?.entityId == row.entityId){
        console.log("found???", node);
        node.removeFromParent()

        // scene.remove(node);
        // node.visible = false;
        // node.dispose();
      }
    }
  });
}

// load icon data
export function setupDBIcon(){
  const conn = stateConn.val;
  conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      ctx.db.icons.onInsert(onInsert_Icon);
      ctx.db.icons.onUpdate(onUpdate_Icon);
      ctx.db.icons.onDelete(onDelete_Icon);
    })
    // .onError((ctx, error) => {
    //   console.error(`Subscription failed: ${error}`);
    // })
    .subscribe(tables.icons);
    // console.log(tables.icons);
}