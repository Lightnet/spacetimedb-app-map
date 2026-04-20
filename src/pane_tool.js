

import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { stateBuildSelect, buildTypes, dbMapTiles, PARAMS, stateGrid3DPosition, stateIntersectionPoint, stateIsDrag, statePointer2D, statePointer3D, stateOrbitControl, dbImages, stateConn, stateSelectImageId, dbMapMarkers, stateSelectMarkerId, dbTransform3ds, stateAxeHelper, stateStatus } from './context';
import van from "vanjs-core";
import { FloatingWindow, MessageBoard} from "vanjs-ui";

const {div, label, input, button, img, p} = van.tags;

// note does not update by THREE.VECTOR3
function setupEditorPane(){
  const pane = new Pane();
  // console.log(PARAMS);
  pane.addButton({title:'test'}).on('click',()=>{
    // console.log(statePointer2D.val)
    // console.log(PARAMS.pointer3d)
    console.log(dbMapTiles)
  })

  const cursorFolder = pane.addFolder({title:"Cursor"});

  const orbitControlFolder = pane.addFolder({title:"OrbitControl"});
  orbitControlFolder.addBinding(stateOrbitControl.val,'enabled');

  cursorFolder.addBinding(stateIsDrag,'val',{label:'Is Drag'})

  const cursorPlaneFolder = cursorFolder.addFolder({title:"3D Pointer Plane"});
  // cursorFolder.addBinding(PARAMS, 'pointertd',{ disabled:true, readonly:true });// does not work crash for some reason from  readonly
  cursorPlaneFolder.addBinding(statePointer3D.val, 'x',{ readonly:true });
  cursorPlaneFolder.addBinding(statePointer3D.val, 'y',{ readonly:true });
  cursorPlaneFolder.addBinding(statePointer3D.val, 'z',{ readonly:true });

  const gridPlaneFolder = cursorFolder.addFolder({title:"3D Grid Plane"});
  gridPlaneFolder.addBinding(stateGrid3DPosition.val, 'x',{ readonly:true });
  gridPlaneFolder.addBinding(stateGrid3DPosition.val, 'y',{ readonly:true });
  gridPlaneFolder.addBinding(stateGrid3DPosition.val, 'z',{ readonly:true });
  
  const buildFolder = cursorFolder.addFolder({title:"Build"});

  let buildType = localStorage.getItem('BUILDTYPE') ?? 'TILE';

  buildFolder.addBlade({
    view: 'list',
    label: 'Build Type',
    options: buildTypes.val,
    value: buildType,
  }).on('change',(e)=>{
    stateBuildSelect.val = e.value;
    localStorage.setItem('BUILDTYPE', e.value);
  })
  buildFolder.addBinding(stateBuildSelect, 'val', {label:'Select', readonly:true})

  const makerFolder = pane.addFolder({title:"Markers"});
  makerFolder.addBinding(stateSelectMarkerId,'val',{label:'Select Id:',readonly:true})
  let markerBinding;
  van.derive(()=>{

    if(markerBinding) markerBinding.dispose();

    let markers = []
    for(const marker of dbMapMarkers.val.values()){
      // console.log(marker);
      markers.push({
        text:marker.entityId,
        value:marker.entityId,
      })
    }

    markerBinding = makerFolder.addBlade({
      view: 'list',
      label: 'Select',
      options: markers,
      value: '',
    }).on('change',(e)=>{
      // e.value;
      console.log(e.value)
      stateSelectMarkerId.val = e.value;
      // console.log(stateAxeHelper.val);
      if(stateAxeHelper.val){
        const t3 = dbTransform3ds.val.get(e.value)
        // console.log(t3)
        stateAxeHelper.val.position.set(
          t3.position.x,
          t3.position.y,
          t3.position.z
        )
      }
    })
  })


  const imageFolder = pane.addFolder({title: 'Image'});
  imageFolder.addButton({title:'Upload'}).on('click',()=>{
    open_window_upload();
  });
  imageFolder.addButton({title:'Select Images'}).on('click',()=>{
    open_window_icon();
  });
  imageFolder.addButton({title:'Delete Image'}).on('click',()=>{
    const conn = stateConn.val;
    conn.reducers.deleteImage({
      id: stateSelectImageId.val
    })
  });

  imageFolder.addBinding(stateSelectImageId,'val',{label:"Image Id:",readonly:true});

  imageFolder.addButton({title:'Assign Icon'}).on('click',()=>{
    const conn = stateConn.val;
    conn.reducers.createIcon({
      imageId: stateSelectImageId.val,
      entityId: stateSelectMarkerId.val,
    });
  });

  imageFolder.addButton({title:'Delete Icon'}).on('click',()=>{
    const conn = stateConn.val;
    conn.reducers.deleteIcon({
      id: stateSelectImageId.val
    });
  });

}

function UITool(){
  // console.log(div);
  return div({style:`position:fixed; top:0px; left:0px;background-color:gray;`},
    
    label("Status:"),
    label(()=>stateStatus.val),
  );
}

function setupSelectPanel(){
  van.add(document.body, UITool())
}

export function setupPane(){
  setupEditorPane();
  setupSelectPanel();
}

function open_window_upload(){
  van.add(document.body, window_upload_image())
}

function window_upload_image(){
  const closed = van.state(false);
  const width = van.state(300);
  const height = van.state(300);
  const fileEl = input({onchange:onChangeFile,type:"file"});
  const iamgeEl = img({width:64,height:64});

  function onChangeFile(){
    const file = fileEl.files[0];
    if(file){
      const tempUrl = URL.createObjectURL(file);
      iamgeEl.src = tempUrl;
    }
  }

  async function upload_file(event){
    console.log(event);
    console.log(fileEl);
    const file = fileEl.files[0];
    if(file){
      console.log(file);
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);
      try {
        const conn = stateConn.val;
        await conn.reducers.uploadImage({
          name:file.name,
          mimeType:file.type,
          data:fileBytes
        });  
        console.log("pass!");
        closed.val = true;
      } catch (error) {
        console.log("upload failed!");
        console.log(error.message);
      }
    }
  }

  return FloatingWindow({title: "Upload Image File:", closed, width:width.val, height, closeCross: null},
    div({style: "display: flex; flex-direction: column; justify-content: center;"},
      p("Preview"),
      iamgeEl,
      p("Select Single Image!"),
      fileEl,
      button({onclick:upload_file}, "Upload"),
      button({onclick: () => closed.val = true}, "Close"),
    ),
  )
}

function open_window_icon(){
  van.add(document.body, window_images())
}

function window_images(){
  const closed = van.state(false);
  const width = van.state(300);
  const height = van.state(300);
  const iamgeEl = img({width:64,height:64});
  const imagesEl = div();

  function selectImageId(id){
    console.log("id: ", id);
    stateSelectImageId.val = id;
  }

  function loadImages(){
    const images = dbImages.val;
    console.log(images);
    for(const image of images.values()){
      console.log(image);

      const blob = new Blob([image.data], { type: "image/png" }); 
      const tempUrl = URL.createObjectURL(blob);
      // const tempUrl = URL.createObjectURL(image.data);
      const tmp = img({width:64, height:64, style:`background-color:gray;`, onclick:()=>selectImageId(image.id)});
      tmp.src = tempUrl;
      van.add(imagesEl, tmp);
    }
  }

  loadImages();

  return FloatingWindow({title: "Icons:", closed, width:width.val, height, closeCross: null},
    div({style: "display: flex; flex-direction: column; justify-content: center;"},
      p("Preview"),
      iamgeEl,
      p("Select Icon:"),
      imagesEl,
      button({onclick: () => closed.val = true}, "Close"),
    ),
  )
}
